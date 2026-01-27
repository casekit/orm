/**
 * NB. You'll see a lot of `as unknown as` and other nasty looking typecasting
 * in this file. This is because this is the boundary between the very specific
 * types of the ORM as used by the user and the more general types of the ORMs
 * implementation. The specific types are not helpful for the internals (in
 * fact they would make it much harder if not impossible to write) - so we
 * have this one specific place where we forcibly cast between the specific to
 * the general - and nowhere else in the project should be doing this.
 */
import { mapValues, pick, pickBy } from "es-toolkit";
import { QueryResultRow } from "pg";
import { DeepReadonly } from "ts-essentials";
import { ZodType, z } from "zod";

import {
    NormalizedConfig,
    getModel,
    normalizeConfig,
} from "@casekit/orm-config";
import {
    Config,
    ModelDefinition,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";
import { SQLStatement, sql } from "@casekit/sql";
import type { Conform, Simplify } from "@casekit/toolbox";

import { Connection, Transaction } from "./connection.js";
import { count } from "./orm.count.js";
import { createMany } from "./orm.createMany.js";
import { createOne } from "./orm.createOne.js";
import { deleteMany } from "./orm.deleteMany.js";
import { deleteOne } from "./orm.deleteOne.js";
import { findMany } from "./orm.findMany.js";
import { findOne } from "./orm.findOne.js";
import { updateMany } from "./orm.updateMany.js";
import { updateOne } from "./orm.updateOne.js";
import { CountParams } from "./types/CountParams.js";
import { CreateManyParams } from "./types/CreateManyParams.js";
import { CreateManyResult } from "./types/CreateManyResult.js";
import { CreateOneParams } from "./types/CreateOneParams.js";
import { CreateOneResult } from "./types/CreateOneResult.js";
import { DeleteManyResult } from "./types/DeleteManyResult.js";
import { DeleteOneResult } from "./types/DeleteOneResult.js";
import { DeleteParams } from "./types/DeleteParams.js";
import { FindParams } from "./types/FindParams.js";
import { FindResult } from "./types/FindResult.js";
import { Middleware } from "./types/Middleware.js";
import { RestrictModels } from "./types/RestrictModels.js";
import { ReturningClause } from "./types/ReturningClause.js";
import { UpdateManyResult } from "./types/UpdateManyResult.js";
import { UpdateOneResult } from "./types/UpdateOneResult.js";
import { UpdateParams } from "./types/UpdateParams.js";
import {
    findManyResultSchema,
    findOneResultSchema,
    returningManyResultSchema,
    returningOneResultSchema,
} from "./util/resultSchema.js";

export const orm = <const C extends Config>(config: C): Orm<C> => {
    return new Orm<C>(normalizeConfig(config));
};

export class Orm<
    const C extends Config = Config,
    const Models extends ModelDefinitions = C["models"],
    const Operators extends OperatorDefinitions =
        C["operators"] extends NonNullable<C["operators"]>
            ? C["operators"]
            : { where: never },
> {
    public readonly config: NormalizedConfig;
    private readonly _connection: Connection | Transaction;
    private readonly _middleware: Middleware[];

    constructor(
        config: NormalizedConfig,
        connection?: Connection | Transaction,
        middleware?: Middleware[],
    ) {
        this.config = config;
        this._connection = connection ?? new Connection(config);
        this._middleware = middleware ?? [];
    }

    public async connect() {
        await this._connection.connect();
    }

    public async close() {
        await this._connection.close();
    }

    public async transact<T>(
        fn: (db: Orm<C>) => Promise<T>,
        options = { rollback: false },
    ) {
        const tx = await this._connection.startTransaction();
        try {
            const result = await fn(
                new Orm<C>(this.config, tx, this._middleware),
            );
            if (options.rollback) {
                await tx.rollback();
            } else {
                await tx.commit();
            }
            return result;
        } catch (e) {
            if (tx.open) {
                await tx.rollback();
            }
            throw e;
        }
    }

    private getNextMiddleware(
        type: keyof Middleware,
    ): [mw: ((..._args: unknown[]) => unknown) | null, next: Middleware[]] {
        const mwIndex = this._middleware.findIndex((mw) => !!mw[type]);
        if (mwIndex > -1) {
            const next = this._middleware.map((mw, index) =>
                index === mwIndex ? { ...mw, [type]: undefined } : mw,
            );
            const mw = this._middleware[mwIndex]![type]! as (
                ...args: unknown[]
            ) => unknown;
            return [mw, next];
        } else {
            return [null, this._middleware];
        }
    }

    public async findOne<
        const M extends ModelName<Models>,
        const Q extends FindParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<FindParams<Models, Operators, M>, Q>,
    ): Promise<DeepReadonly<Simplify<FindResult<Models, Operators, M, Q>>>> {
        const [mw, next] = this.getNextMiddleware("findOne");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<FindResult<Models, Operators, M, Q>>
            >;
        }

        const result = await findOne(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as FindParams<ModelDefinitions, OperatorDefinitions, string>,
        );

        const schema = findOneResultSchema(
            this.config,
            modelName,
            query as FindParams<ModelDefinitions, OperatorDefinitions, string>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<FindResult<Models, Operators, M, Q>>
        >;
    }

    public async findMany<
        const M extends ModelName<Models>,
        const Q extends FindParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<FindParams<Models, Operators, M>, Q>,
    ): Promise<DeepReadonly<Simplify<FindResult<Models, Operators, M, Q>>[]>> {
        const [mw, next] = this.getNextMiddleware("findMany");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<FindResult<Models, Operators, M, Q>>[]
            >;
        }

        const result = await findMany(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as FindParams<ModelDefinitions, Operators, M>,
        );

        const schema = findManyResultSchema(
            this.config,
            modelName,
            query as FindParams<ModelDefinitions, Operators, M>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<FindResult<Models, Operators, M, Q>>[]
        >;
    }

    public async count<
        const M extends ModelName<Models>,
        const Q extends CountParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<CountParams<Models, Operators, M>, Q>,
    ): Promise<number> {
        const [mw, next] = this.getNextMiddleware("count");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as Promise<number>;
        }
        return await count(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as CountParams<
                Record<string, Required<ModelDefinition>>,
                OperatorDefinitions,
                string
            >,
        );
    }

    public async createOne<
        const M extends ModelName<Models>,
        const Q extends CreateOneParams<Models, M>,
    >(
        modelName: M,
        query: Conform<CreateOneParams<Models, M>, Q>,
    ): Promise<DeepReadonly<Simplify<CreateOneResult<Models, M, Q>>>> {
        const [mw, next] = this.getNextMiddleware("createOne");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<CreateOneResult<Models, M, Q>>
            >;
        }

        const result = await createOne(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as CreateOneParams<ModelDefinitions, M>,
        );

        const schema = returningOneResultSchema(
            getModel(this.config.models, modelName),
            query.returning as ReturningClause<ModelDefinition>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<CreateOneResult<Models, M, Q>>
        >;
    }

    public async createMany<
        const M extends ModelName<Models>,
        const Q extends CreateManyParams<Models, M>,
    >(
        modelName: M,
        query: Conform<CreateManyParams<Models, M>, Q>,
    ): Promise<DeepReadonly<Simplify<CreateManyResult<Models, M, Q>>>> {
        const [mw, next] = this.getNextMiddleware("createMany");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<CreateManyResult<Models, M, Q>>
            >;
        }

        const result = await createMany(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as CreateManyParams<ModelDefinitions, M>,
        );

        const schema = returningManyResultSchema(
            getModel(this.config.models, modelName),
            query.returning as ReturningClause<ModelDefinition>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<CreateManyResult<Models, M, Q>>
        >;
    }

    public async updateOne<
        const M extends ModelName<Models>,
        const Q extends UpdateParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<UpdateParams<Models, Operators, M>, Q>,
    ): Promise<
        DeepReadonly<Simplify<UpdateOneResult<Models, Operators, M, Q>>>
    > {
        const [mw, next] = this.getNextMiddleware("updateOne");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<UpdateOneResult<Models, Operators, M, Q>>
            >;
        }

        const result = await updateOne(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as UpdateParams<ModelDefinitions, Operators, M>,
        );

        const schema = returningOneResultSchema(
            getModel(this.config.models, modelName),
            query.returning as ReturningClause<ModelDefinition>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<UpdateOneResult<Models, Operators, M, Q>>
        >;
    }

    public async updateMany<
        const M extends ModelName<Models>,
        const Q extends UpdateParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<UpdateParams<Models, Operators, M>, Q>,
    ): Promise<
        DeepReadonly<Simplify<UpdateManyResult<Models, Operators, M, Q>>>
    > {
        const [mw, next] = this.getNextMiddleware("updateMany");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<UpdateManyResult<Models, Operators, M, Q>>
            >;
        }

        const result = await updateMany(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as UpdateParams<ModelDefinitions, Operators, M>,
        );

        const schema = returningManyResultSchema(
            getModel(this.config.models, modelName),
            query.returning as ReturningClause<ModelDefinition>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<UpdateManyResult<Models, Operators, M, Q>>
        >;
    }

    public async deleteOne<
        const M extends ModelName<Models>,
        const Q extends DeleteParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<DeleteParams<Models, Operators, M>, Q>,
    ): Promise<
        DeepReadonly<Simplify<DeleteOneResult<Models, Operators, M, Q>>>
    > {
        const [mw, next] = this.getNextMiddleware("deleteOne");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<DeleteOneResult<Models, Operators, M, Q>>
            >;
        }

        const result = await deleteOne(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as DeleteParams<ModelDefinitions, Operators, M>,
        );

        const schema = returningOneResultSchema(
            getModel(this.config.models, modelName),
            query.returning as ReturningClause<ModelDefinition>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<DeleteOneResult<Models, Operators, M, Q>>
        >;
    }

    public async deleteMany<
        const M extends ModelName<Models>,
        const Q extends DeleteParams<Models, Operators, M>,
    >(
        modelName: M,
        query: Conform<DeleteParams<Models, Operators, M>, Q>,
    ): Promise<
        DeepReadonly<Simplify<DeleteManyResult<Models, Operators, M, Q>>>
    > {
        const [mw, next] = this.getNextMiddleware("deleteMany");
        if (mw) {
            const db = new Orm<C, Models, Operators>(
                this.config,
                this._connection,
                next,
            );

            // the type cast here is needed for the recursive call because
            // otherwise typescript goes absolutely haywire causing an OOM error
            return (await mw(db, modelName, query)) as DeepReadonly<
                Simplify<DeleteManyResult<Models, Operators, M, Q>>
            >;
        }

        const result = await deleteMany(
            this.config,
            this._connection,
            this._middleware,
            modelName,
            query as DeleteParams<ModelDefinitions, Operators, M>,
        );

        const schema = returningManyResultSchema(
            getModel(this.config.models, modelName),
            query.returning as ReturningClause<ModelDefinition>,
        );

        return schema.parse(result) as DeepReadonly<
            Simplify<DeleteManyResult<Models, Operators, M, Q>>
        >;
    }

    /**
     * In some parts of your app - e.g. in the non-tenant specific parts of
     * a multi-tenant app, where you don't want to restrict by tenant_id -
     * you may want to only make a subset of models available for querying.
     * This method allows you to do that by creating a restricted copy of
     * the ORM with access only to the models you specify.
     */
    public restrict<const Allowed extends [...ModelName<Models>[]]>(
        allowed: Allowed,
    ): Orm<RestrictModels<C, Allowed[number]>> {
        if (this._connection.isTransaction()) {
            throw new Error("Cannot create restricted ORM in a transaction");
        }
        // TODO - update this to also include join models for N:N relations
        const config = {
            ...this.config,
            models: mapValues(pick(this.config.models, allowed), (model) => ({
                ...model,
                relations: pickBy(model.relations, (r) =>
                    // @ts-expect-error - need TS to treat allowed as a string[] here
                    // but it wants to treat it as the more specific "Allowed" type
                    allowed.includes(r.model),
                ),
            })),
        } as unknown as NormalizedConfig;
        return new Orm<RestrictModels<C, Allowed[number]>>(
            config,
            this._connection,
            this._middleware,
        );
    }

    /** Returns a new ORM instance with middleware applied.
     * The new ORM instance shares the same connection as
     * the one it is called on, but the original instance
     * does not have the middleware applied. This means
     * this method can be called multiple times to apply
     * different middleware to different ORM instances.
     */
    public middleware(middleware: Middleware[]): Orm<C> {
        return new Orm(this.config, this._connection, middleware);
    }

    /**
     * await db.query(z.object({ foo: z.string() }))`
     *     SELECT foo FROM table WHERE foo = ${value}
     * `;
     */
    public query<const ResultType extends QueryResultRow = QueryResultRow>(
        schema: ZodType<ResultType>,
    ): (
        fragments: TemplateStringsArray,
        ...values: unknown[]
    ) => Promise<ResultType[]>;

    /**
     * const statement = sql<{ one: number }>`SELECT 1 as one`;
     * await db.query(statement);
     */
    public query<const ResultType extends QueryResultRow = QueryResultRow>(
        statement: SQLStatement<ResultType>,
    ): Promise<ResultType[]>;

    /**
     * await db.query<{ one: number }>`SELECT 1 as one`;
     */
    public query<ResultType extends QueryResultRow = QueryResultRow>(
        fragments: TemplateStringsArray,
        ...values: unknown[]
    ): Promise<ResultType[]>;

    public query<const ResultType extends QueryResultRow = QueryResultRow>(
        schemaOrStatementOrFragments:
            | SQLStatement
            | TemplateStringsArray
            | ZodType<ResultType>,
        ...values: unknown[]
    ):
        | Promise<ResultType[]>
        | ((
              fragments: TemplateStringsArray,
              ...values: unknown[]
          ) => Promise<ResultType[]>) {
        if (schemaOrStatementOrFragments instanceof ZodType) {
            return this.queryWithSchema(schemaOrStatementOrFragments);
        }

        if (schemaOrStatementOrFragments instanceof SQLStatement) {
            return this.queryWithSQLStatement<ResultType>(
                schemaOrStatementOrFragments as SQLStatement<ResultType>,
            );
        }
        return this.queryWithTemplateLiteral<ResultType>(
            schemaOrStatementOrFragments,
            ...values,
        );
    }

    private queryWithTemplateLiteral<
        const ResultType extends QueryResultRow = QueryResultRow,
    >(
        fragments: TemplateStringsArray,
        ...values: unknown[]
    ): Promise<ResultType[]> {
        return this._connection
            .query(sql(fragments, ...values))
            .then((result) => result.rows as ResultType[]);
    }

    private queryWithSQLStatement<
        const ResultType extends QueryResultRow = QueryResultRow,
    >(statement: SQLStatement<ResultType>): Promise<ResultType[]> {
        const result = this._connection.query<ResultType>(statement);
        if (statement.schema) {
            const schema = statement.schema;
            return result.then((result) => z.array(schema).parse(result.rows));
        } else {
            return result.then((result) => result.rows);
        }
    }

    private queryWithSchema<
        const ResultType extends QueryResultRow = QueryResultRow,
    >(
        schema: ZodType<ResultType>,
    ): (
        fragments: TemplateStringsArray,
        ...values: unknown[]
    ) => Promise<ResultType[]> {
        return (fragments: TemplateStringsArray, ...values: unknown[]) => {
            const result = this._connection.query(sql(fragments, ...values));
            return result.then((result) => z.array(schema).parse(result.rows));
        };
    }
}
