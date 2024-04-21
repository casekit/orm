import { QueryResultRow } from "pg";
import { z } from "zod";

import { Connection } from "./Connection";
import { OrmError } from "./errors";
import { count } from "./queries/count";
import { BaseCountParams } from "./queries/count/types/BaseCountParams";
import { CountParams } from "./queries/count/types/CountParams";
import { createResultSchema } from "./queries/create/createResultSchema";
import { BaseCreateManyParams } from "./queries/create/types/BaseCreateManyParams";
import { BaseCreateOneParams } from "./queries/create/types/BaseCreateOneParams";
import { CreateManyParams } from "./queries/create/types/CreateManyParams";
import { CreateManyResult } from "./queries/create/types/CreateManyResult";
import { CreateOneParams } from "./queries/create/types/CreateOneParams";
import { CreateOneResult } from "./queries/create/types/CreateOneResult";
import { createMany } from "./queries/createMany";
import { createOne } from "./queries/createOne";
import { deleteResultSchema } from "./queries/delete/deleteResultSchema";
import { BaseDeleteParams } from "./queries/delete/types/BaseDeleteParams";
import { DeleteManyResult } from "./queries/delete/types/DeleteManyResult";
import { DeleteOneResult } from "./queries/delete/types/DeleteOneResult";
import { DeleteParams } from "./queries/delete/types/DeleteParams";
import { deleteMany } from "./queries/deleteMany";
import { deleteOne } from "./queries/deleteOne";
import { findResultSchema } from "./queries/find/findResultSchema";
import { FindManyParams } from "./queries/find/types/FindManyParams";
import { FindManyResult } from "./queries/find/types/FindManyResult";
import { FindOneResult } from "./queries/find/types/FindOneResult";
import { findMany } from "./queries/findMany";
import { findOne } from "./queries/findOne";
import { BaseUpdateParams } from "./queries/update/types/BaseUpdateParams";
import { UpdateManyResult } from "./queries/update/types/UpdateManyResult";
import { UpdateOneResult } from "./queries/update/types/UpdateOneResult";
import { UpdateParams } from "./queries/update/types/UpdateParams";
import { updateResultSchema } from "./queries/update/updateResultSchema";
import { updateMany } from "./queries/updateMany";
import { updateOne } from "./queries/updateOne";
import { populateConfiguration } from "./schema/populate/populateConfiguration";
import { BaseConfiguration } from "./schema/types/base/BaseConfiguration";
import { BaseModel } from "./schema/types/base/BaseModel";
import { ModelName } from "./schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "./schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "./schema/types/loose/LooseRelationsDefinitions";
import { validateConfiguration } from "./schema/validate/validateConfiguration";
import { sql } from "./sql";
import { Configuration } from "./types/Configuration";
import { DisallowExtraKeys } from "./types/util/DisallowExtraKeys";

export class Orm<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
> {
    public config: BaseConfiguration;

    /**
     * As a nicety, we expose the models directly on the Orm instance with literal keys
     * for the models. The deeper values are not literally typed however.
     */
    public get models(): {
        [M in ModelName<Models>]: BaseModel;
    } {
        return this.config.models as {
            [M in ModelName<Models>]: BaseModel;
        };
    }

    public get connection(): Connection {
        return this.config.connection;
    }

    constructor(config: BaseConfiguration) {
        this.config = config;
    }

    public async transact<T>(
        cb: (db: Orm<Models, Relations>) => Promise<T>,
        opts = { rollback: false },
    ): Promise<T> {
        return await this.connection.transact(async (conn) => {
            return await cb(
                new Orm<Models, Relations>({
                    ...this.config,
                    connection: conn,
                }),
            );
        }, opts);
    }

    public async findMany<
        M extends ModelName<Models>,
        Q extends FindManyParams<Models, Relations, M>,
    >(
        m: M,
        query: DisallowExtraKeys<FindManyParams<Models, Relations, M>, Q>,
    ): Promise<FindManyResult<Models, Relations, M, Q>> {
        const results = await findMany(this.connection, this.config, m, query);
        const parser = z.array(findResultSchema(this.config, m, query));
        return parser.parse(results) as FindManyResult<Models, Relations, M, Q>;
    }

    public async findOne<
        M extends ModelName<Models>,
        Q extends FindManyParams<Models, Relations, M>,
    >(
        m: M,
        query: DisallowExtraKeys<FindManyParams<Models, Relations, M>, Q>,
    ): Promise<FindOneResult<Models, Relations, M, Q>> {
        const result = await findOne(this.connection, this.config, m, query);
        const parser = findResultSchema(this.config, m, query);
        return parser.parse(result) as FindOneResult<Models, Relations, M, Q>;
    }

    public async createOne<
        M extends ModelName<Models>,
        P extends CreateOneParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<CreateOneParams<Models, M>, P>,
    ): Promise<CreateOneResult<Models, M, P>> {
        const result = await createOne(
            this.connection,
            this.config,
            m,
            params as BaseCreateOneParams,
        );
        const parser = createResultSchema(
            this.config,
            m,
            params as BaseCreateOneParams,
        );
        return parser.parse(result) as CreateOneResult<Models, M, P>;
    }

    public async createMany<
        M extends ModelName<Models>,
        P extends CreateManyParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<CreateManyParams<Models, M>, P>,
    ): Promise<CreateManyResult<Models, M, P>> {
        const result = await createMany(
            this.connection,
            this.config,
            m,
            params as BaseCreateManyParams,
        );
        if (typeof result === "number")
            return result as CreateManyResult<Models, M, P>;

        const parser = z.array(
            createResultSchema(this.config, m, params as BaseCreateManyParams),
        );
        return parser.parse(result) as CreateManyResult<Models, M, P>;
    }

    public async updateOne<
        M extends ModelName<Models>,
        P extends UpdateParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<UpdateParams<Models, M>, P>,
    ): Promise<UpdateOneResult<Models, M, P>> {
        const result = await updateOne(
            this.connection,
            this.config,
            m,
            params as BaseUpdateParams,
        );
        const parser = updateResultSchema(
            this.config,
            m,
            params as BaseUpdateParams,
        );
        return parser.parse(result) as UpdateOneResult<Models, M, P>;
    }

    public async updateMany<
        M extends ModelName<Models>,
        P extends UpdateParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<UpdateParams<Models, M>, P>,
    ): Promise<UpdateManyResult<Models, M, P>> {
        const result = await updateMany(
            this.connection,
            this.config,
            m,
            params as BaseUpdateParams,
        );

        if (typeof result === "number")
            return result as UpdateManyResult<Models, M, P>;

        const parser = z.array(
            updateResultSchema(this.config, m, params as BaseUpdateParams),
        );
        return parser.parse(result) as UpdateManyResult<Models, M, P>;
    }

    public async deleteOne<
        M extends ModelName<Models>,
        P extends DeleteParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<DeleteParams<Models, M>, P>,
    ): Promise<DeleteOneResult<Models, M, P>> {
        const parser = deleteResultSchema(
            this.config,
            m,
            params as BaseDeleteParams,
        );

        if (this.config.middleware.delete?.deleteOne) {
            const result = await this.config.middleware.delete.deleteOne(
                params,
                {
                    model: m,
                    config: this.config,
                    deleteOne: (params) => {
                        return deleteOne(
                            this.connection,
                            this.config,
                            m,
                            params,
                            // TODO figure out a better way to type this
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ) as any;
                    },
                    updateOne: (params) => {
                        return updateOne(
                            this.connection,
                            this.config,
                            m,
                            params,
                            // TODO figure out a better way to type this
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ) as any;
                    },
                },
            );

            return parser.parse(result) as DeleteOneResult<Models, M, P>;
        } else {
            const result = await deleteOne(
                this.connection,
                this.config,
                m,
                params as BaseDeleteParams,
            );

            return parser.parse(result) as DeleteOneResult<Models, M, P>;
        }
    }

    public async deleteMany<
        M extends ModelName<Models>,
        P extends DeleteParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<DeleteParams<Models, M>, P>,
    ): Promise<DeleteManyResult<Models, M, P>> {
        const parser = z.array(
            deleteResultSchema(this.config, m, params as BaseDeleteParams),
        );

        if (this.config.middleware.delete?.deleteMany) {
            const result = await this.config.middleware.delete.deleteMany(
                params,
                {
                    model: m,
                    config: this.config,
                    deleteMany: (params) => {
                        return deleteMany(
                            this.connection,
                            this.config,
                            m,
                            params,
                            // TODO figure out a better way to type this
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ) as any;
                    },
                    updateMany: (params) => {
                        return updateMany(
                            this.connection,
                            this.config,
                            m,
                            params,
                            // TODO figure out a better way to type this
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ) as any;
                    },
                },
            );

            return (
                typeof result === "number" ? result : parser.parse(result)
            ) as DeleteManyResult<Models, M, P>;
        } else {
            const result = await deleteMany(
                this.connection,
                this.config,
                m,
                params as BaseDeleteParams,
            );

            return (
                typeof result === "number" ? result : parser.parse(result)
            ) as DeleteManyResult<Models, M, P>;
        }
    }

    public async count<
        M extends ModelName<Models>,
        P extends CountParams<Models, Relations, M>,
    >(
        m: M,
        params: DisallowExtraKeys<CountParams<Models, Relations, M>, P>,
    ): Promise<number> {
        const result = await count(
            this.connection,
            this.config,
            m,
            params as BaseCountParams,
        );
        return z.coerce.number().parse(result);
    }

    public async query<T extends QueryResultRow>(
        fragments: TemplateStringsArray,
        ...variables: readonly unknown[]
    ) {
        const query = sql(fragments, ...variables);
        if (!process.env.CI) console.log(query.text);
        const result = await this.connection.query<T>(query);
        return result.rows;
    }

    public async queryOne<T extends QueryResultRow>(
        fragments: TemplateStringsArray,
        ...variables: readonly unknown[]
    ) {
        const query = sql(fragments, ...variables);
        if (!process.env.CI) console.log(query.text);
        const result = await this.connection.query<T>(query);
        if (result.rowCount === 0 || result.rowCount === null)
            throw new OrmError("No rows returned from query");

        if (result.rowCount > 1)
            throw new OrmError("More than one row returned from query");

        return result.rows[0];
    }
}

export const orm = <
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
>(
    config: Configuration<Models, Relations>,
): Orm<Models, Relations> => {
    const populatedSchema = populateConfiguration(config);
    validateConfiguration(populatedSchema);
    return new Orm<Models, Relations>(populatedSchema);
};
