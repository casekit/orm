import { SQLStatement, sql } from "@casekit/orm";

export const createExtensionsSql = (
    schema: string,
    extension: string,
): SQLStatement => {
    return sql`CREATE EXTENSION IF NOT EXISTS ${sql.ident(extension)} SCHEMA ${sql.ident(schema)};`;
};
