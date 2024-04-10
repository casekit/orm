import pg from "pg";
import { z } from "zod";

import { createResultSchema } from "./queries/create/createResultSchema";
import { createMany } from "./queries/createMany";
import { createOne } from "./queries/createOne";
import { findResultSchema } from "./queries/find/findResultSchema";
import { findMany } from "./queries/findMany";
import { findOne } from "./queries/findOne";
import { BaseCreateManyParams } from "./queries/types/BaseCreateManyParams";
import { BaseCreateOneParams } from "./queries/types/BaseCreateOneParams";
import { CreateManyParams } from "./queries/types/CreateManyParams";
import { CreateManyResult } from "./queries/types/CreateManyResult";
import { CreateOneParams } from "./queries/types/CreateOneParams";
import { CreateOneResult } from "./queries/types/CreateOneResult";
import { FindManyQuery } from "./queries/types/FindManyQuery";
import { QueryResult } from "./queries/types/QueryResult";
import { populateConfiguration } from "./schema/populate/populateConfiguration";
import { BaseConfiguration } from "./schema/types/base/BaseConfiguration";
import { BaseModel } from "./schema/types/base/BaseModel";
import { ModelDefinitions } from "./schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "./schema/types/definitions/RelationsDefinitions";
import { ModelName } from "./schema/types/helpers/ModelName";
import { validateConfiguration } from "./schema/validate/validateConfiguration";
import { Configuration } from "./types/Configuration";
import { Connection } from "./types/Connection";
import { DisallowExtraKeys } from "./types/util/DisallowExtraKeys";

export class Orm<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
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

    private pool: pg.Pool;
    private poolClient?: pg.PoolClient;

    public get connection(): Connection {
        return this.poolClient ?? this.pool;
    }

    constructor(config: BaseConfiguration, poolClient?: pg.PoolClient) {
        this.config = config;
        this.pool = new pg.Pool(config.connection ?? {});
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
                    this.config,
                    conn,
                ).transact(cb, opts);
            } finally {
                conn.release();
            }
        } else {
            try {
                this.poolClient.query("BEGIN");
                return await cb(
                    new Orm<Models, Relations>(this.config, this.poolClient),
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
        Q extends FindManyQuery<Models, Relations, M>,
    >(
        m: M,
        query: DisallowExtraKeys<FindManyQuery<Models, Relations, M>, Q>,
    ): Promise<QueryResult<Models, Relations, M, Q>[]> {
        const results = await findMany(this.connection, this.config, m, query);
        const parser = z.array(findResultSchema(this.config, m, query));
        return parser.parse(results) as QueryResult<Models, Relations, M, Q>[];
    }

    public async findOne<
        M extends ModelName<Models>,
        Q extends FindManyQuery<Models, Relations, M>,
    >(
        m: M,
        query: DisallowExtraKeys<FindManyQuery<Models, Relations, M>, Q>,
    ): Promise<QueryResult<Models, Relations, M, Q>> {
        const result = await findOne(this.connection, this.config, m, query);
        const parser = findResultSchema(this.config, m, query);
        return parser.parse(result) as QueryResult<Models, Relations, M, Q>;
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
        const parser = z.array(
            createResultSchema(this.config, m, params as BaseCreateManyParams),
        );
        return parser.parse(result) as CreateManyResult<Models, M, P>;
    }
}

export const orm = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    schema: Configuration<Models, Relations>,
): Orm<Models, Relations> => {
    const populatedSchema = populateConfiguration(schema);
    validateConfiguration(populatedSchema);
    return new Orm<Models, Relations>(populatedSchema);
};
