import { uniq } from "lodash";
import pgfmt from "pg-format";
import { Schema } from "~/types/schema";

export const createSchemasSql = (schema: Schema) => {
    const schemas = uniq(Object.values(schema.models).map((m) => m.schema));

    return schemas
        .map((s) => pgfmt("CREATE SCHEMA IF NOT EXISTS %I;", s))
        .join("\n\n");
};
