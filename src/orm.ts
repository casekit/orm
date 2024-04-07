import pg from "pg";
import { z } from "zod";

import { create } from "./queries/create";
import { findMany } from "./queries/findMany";
import { createResultSchema } from "./queries/results/createResultSchema";
import { queryResultSchema } from "./queries/results/queryResultSchema";
import { populateConfiguration } from "./schema/populateConfiguration";
import { validateSchema } from "./schema/validateSchema";
import { Configuration } from "./types/Configuration";
import { Connection } from "./types/Connection";
import { BaseCreateParams } from "./types/queries/BaseCreateParams";
import { CreateParams } from "./types/queries/CreateParams";
import { CreateResult } from "./types/queries/CreateResult";
import { FindManyQuery } from "./types/queries/FindManyQuery";
import { QueryResult } from "./types/queries/QueryResult";
import { BaseConfiguration } from "./types/schema/base/BaseConfiguration";
import { BaseModel } from "./types/schema/base/BaseModel";
import { ModelDefinitions } from "./types/schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "./types/schema/definitions/RelationsDefinitions";
import { ModelName } from "./types/schema/helpers/ModelName";
import { DisallowExtraKeys } from "./types/util/DisallowExtraKeys";

export class Orm<
    Models extends ModelDefinitions = ModelDefinitions,
    Relations extends
        RelationsDefinitions<Models> = RelationsDefinitions<Models>,
> {
    public schema: BaseConfiguration;

    /**
     * As a nicety, we expose the models directly on the Orm instance with literal keys
     * for the models. The deeper values are not literally typed however.
     */
    public get models(): {
        [M in ModelName<Models>]: BaseModel;
    } {
        return this.schema.models as {
            [M in ModelName<Models>]: BaseModel;
        };
    }

    private pool: pg.Pool;
    private poolClient?: pg.PoolClient;

    public get connection(): Connection {
        return this.poolClient ?? this.pool;
    }

    constructor(schema: BaseConfiguration, poolClient?: pg.PoolClient) {
        this.schema = schema;
        this.pool = new pg.Pool(schema.connection ?? {});
        this.poolClient = poolClient;
    }

    public async transact<T>(
        cb: (db: Orm<Models, Relations>) => Promise<T>,
        opts = { rollback: false },
    ): Promise<T> {
        if (!this.poolClient) {
            const conn = await this.pool.connect();
            try {
                return await new Orm<Models, Relations>(
                    this.schema,
                    conn,
                ).transact(cb, opts);
            } finally {
                conn.release();
            }
        } else {
            try {
                this.poolClient.query("BEGIN");
                return await cb(
                    new Orm<Models, Relations>(this.schema, this.poolClient),
                );
            } finally {
                this.poolClient.query(opts.rollback ? "ROLLBACK" : "COMMIT");
            }
        }
    }

    public async end() {
        return await this.pool.end();
    }

    public async findMany<
        M extends ModelName<Models>,
        Q extends FindManyQuery<Models, M>,
    >(
        m: M,
        query: DisallowExtraKeys<FindManyQuery<Models, M>, Q>,
    ): Promise<QueryResult<Models, M, Q>[]> {
        const results = await findMany(this.connection, this.schema, m, query);
        const parser = z.array(queryResultSchema(this.schema, m, query));
        return parser.parse(results) as QueryResult<Models, M, Q>[];
    }

    public async create<
        M extends ModelName<Models>,
        P extends CreateParams<Models, M>,
    >(
        m: M,
        params: DisallowExtraKeys<CreateParams<Models, M>, P>,
    ): Promise<CreateResult<Models, M, P>> {
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
        return parser.parse(result) as CreateResult<Models, M, P>;
    }
}

export const orm = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    schema: Configuration<Models, Relations>,
): Orm<Models, Relations> => {
    const populatedSchema = populateConfiguration(schema);
    validateSchema(populatedSchema);
    return new Orm<Models, Relations>(populatedSchema);
};
