import { Pool, PoolClient } from "pg";
import { z } from "zod";

import { create } from "./queries/create";
import { findMany } from "./queries/findMany";
import { createResultSchema } from "./queries/results/createResultSchema";
import { queryResultSchema } from "./queries/results/queryResultSchema";
import { populateSchema } from "./schema/populateSchema";
import { validateSchema } from "./schema/validateSchema";
import { Config } from "./types/Config";
import { Connection } from "./types/Connection";
import { BaseCreateParams } from "./types/queries/BaseCreateParams";
import { CreateParams } from "./types/queries/CreateParams";
import { CreateResult } from "./types/queries/CreateResult";
import { FindManyQuery } from "./types/queries/FindManyQuery";
import { QueryResult } from "./types/queries/QueryResult";
import { Model, Schema } from "./types/schema";
import { SchemaDefinition } from "./types/schema/definition/SchemaDefinition";
import { ModelName } from "./types/schema/helpers/ModelName";
import { DeepRequired } from "./types/util/DeepRequired";

export class Orm<S extends SchemaDefinition> {
    public schema: Schema;
    public config: Config;
    public models: { [M in keyof S["models"]]: S["models"][M] & Model };

    private pool: Pool;
    private poolClient?: PoolClient;

    public get connection(): Connection {
        return this.poolClient ?? this.pool;
    }

    constructor(schema: Schema, poolClient?: PoolClient) {
        this.schema = schema;
        this.config = schema.config;
        this.models = schema.models as DeepRequired<S["models"]>;
        this.pool = new Pool(schema.config.connection ?? {});
        this.poolClient = poolClient;
    }

    public async transact<T>(
        cb: (db: Orm<S>) => Promise<T>,
        opts = { rollback: false },
    ): Promise<T> {
        if (!this.poolClient) {
            const conn = await this.pool.connect();
            try {
                return await new Orm<S>(this.schema, conn).transact(cb, opts);
            } finally {
                conn.release();
            }
        } else {
            try {
                this.poolClient.query("BEGIN");
                return await cb(new Orm<S>(this.schema, this.poolClient));
            } finally {
                this.poolClient.query(opts.rollback ? "ROLLBACK" : "COMMIT");
            }
        }
    }

    public async end() {
        return await this.pool.end();
    }

    public async findMany<
        M extends ModelName<S>,
        Q extends FindManyQuery<S, M>,
    >(m: M, query: Q): Promise<QueryResult<S, M, Q>[]> {
        const results = await findMany(this.connection, this.schema, m, query);
        const parser = z.array(queryResultSchema(this.schema, m, query));
        return parser.parse(results) as QueryResult<S, M, Q>[];
    }

    public async create<M extends ModelName<S>, P extends CreateParams<S, M>>(
        m: M,
        params: P,
    ): Promise<CreateResult<S, M, P>> {
        const result = await create(
            this.connection,
            this.schema,
            m,
            params as BaseCreateParams,
        );
        const parser = createResultSchema(
            this.schema,
            m,
            params as BaseCreateParams,
        );
        return parser.parse(result) as CreateResult<S, M, P>;
    }
}

export const orm = <S extends SchemaDefinition>(schema: S): Orm<S> => {
    const populatedSchema = populateSchema(schema);
    validateSchema(populatedSchema);
    return new Orm<S>(populatedSchema);
};
