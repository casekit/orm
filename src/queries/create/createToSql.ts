import pgfmt from "pg-format";

import { SQLStatement, sql } from "../../sql";
import { CreateBuilder } from "./buildCreate";

export const createToSql = (builder: CreateBuilder): SQLStatement => {
    const frag = new SQLStatement();

    const { table, params, returning } = builder;

    if (params.length === 0) {
        frag.push(
            pgfmt("INSERT INTO %I.%I DEFAULT VALUES", table.schema, table.name),
        );
    } else {
        frag.push(pgfmt("INSERT INTO %I.%I (\n", table.schema, table.name));
        frag.push(params.map((p) => pgfmt("    %I", p.name)).join(",\n"));
        frag.push(") VALUES ");
        const values = params[0].values.map((_, index) => {
            return sql`\n(${sql.splat(params.map((p) => p.values[index]))})`;
        });
        frag.push(sql.splat(values));
    }

    if (returning.length > 0) {
        frag.push("\nRETURNING ");
        frag.push(
            returning
                .map((r) => pgfmt(`    %I as %I`, r.name, r.alias))
                .join(",\n"),
        );
    }
    frag.push(";\n");

    return frag;
};
