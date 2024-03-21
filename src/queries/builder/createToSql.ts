import pgfmt from "pg-format";

import { CreateBuilder } from "./buildCreate";

export const createToSql = (
    builder: CreateBuilder,
): [sql: string, variables: unknown[]] => {
    let sql = "";

    const { table, params, returning } = builder;

    sql += pgfmt("INSERT INTO %I.%I (\n", table.schema, table.name);
    sql += params.map((p) => pgfmt("    %I", p.name)).join(",\n");
    sql += ") VALUES (\n";
    sql += params.map((_, n) => pgfmt(`    $${n + 1}`)).join(",\n");
    sql += pgfmt(")");
    if (returning.length > 0) {
        sql += "\nRETURNING ";
        sql += returning
            .map((r) => pgfmt(`    %I as %I`, r.name, r.alias))
            .join(",\n");
    }
    sql += ";";

    return [sql, params.map((p) => p.value)];
};
