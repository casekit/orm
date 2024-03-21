import pgfmt from "pg-format";

import { QueryBuilder } from "./buildQuery";

export const queryToSql = (
    builder: QueryBuilder,
): [sql: string, variables: unknown[]] => {
    let sql = "";
    const variables: unknown[] = [];
    const [table, ..._joinedTables] = builder.tables;

    sql += pgfmt(
        `SELECT ${builder.columns.map((c) => pgfmt(`    %I.%I AS %I`, c.table, c.name, c.alias)).join(",\n")}`,
    );

    sql += pgfmt(`\nFROM %I.%I %I`, table.schema, table.name, table.alias);

    return [sql, variables];
};
