import { sql } from "@casekit/sql";

export const createSchemaSql = (schema: string) => {
    if (schema === "") {
        throw new Error("Cannot create schema with empty name");
    }
    return sql`CREATE SCHEMA IF NOT EXISTS ${sql.ident(schema)};`;
};
