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

    public config: DeepRequired<Config>;
    public models: { [M in keyof S["models"]]: S["models"][M] & Model };

    constructor(schema: S) {
        const populatedSchema = populateSchema(schema);
        validateSchema(populateSchema(schema));

        this.schema = populatedSchema;
        this.config = populatedSchema.config as DeepRequired<Config>;
        this.models = populatedSchema.models as DeepRequired<S["models"]>;
    }

    public async findMany<
        M extends ModelName<S>,
        Q extends FindManyQuery<S, M>,
    >(m: M, query: Q): Promise<QueryResultRow<S, M, Q>[]> {
        return findMany(this.schema, m, query) as Promise<
            QueryResultRow<S, M, Q>[]
        >;
    }
}
