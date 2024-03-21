import { Pool } from "pg";
import { z } from "zod";

import { resultSchema } from "./queries/builder/resultSchema";
import { findMany } from "./queries/findMany";
import { populateSchema } from "./schema/populateSchema";
import { validateSchema } from "./schema/validateSchema";
import { Config } from "./types/Config";
import { FindManyQuery } from "./types/queries/FindManyQuery";
import { QueryResultRow } from "./types/queries/QueryResultRow";
import { Model, Schema } from "./types/schema";
import { SchemaDefinition } from "./types/schema/definition/SchemaDefinition";
import { ModelName } from "./types/schema/helpers/ModelName";
import { DeepRequired } from "./types/util/DeepRequired";

export class Orm<S extends SchemaDefinition> {
    public schema: Schema;

    public config: Config;
    public models: { [M in keyof S["models"]]: S["models"][M] & Model };
    public pool: Pool;

    constructor(schema: S) {
        const populatedSchema = populateSchema(schema);
        validateSchema(populatedSchema);

        this.schema = populatedSchema;
        this.config = populatedSchema.config;
        this.models = populatedSchema.models as DeepRequired<S["models"]>;
        this.pool = new Pool(populatedSchema.config.connection ?? {});
    }

    public async end() {
        return await this.pool.end();
    }

    public async findMany<
        M extends ModelName<S>,
        Q extends FindManyQuery<S, M>,
    >(m: M, query: Q): Promise<QueryResultRow<S, M, Q>[]> {
        const results = await findMany(this.pool, this.schema, m, query);
        return z
            .array(resultSchema(this.schema, m, query))
            .parse(results) as QueryResultRow<S, M, Q>[];
    }
}

export const orm = <S extends SchemaDefinition>(schema: S): Orm<S> =>
    new Orm<S>(schema);
