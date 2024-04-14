import pgfmt from "pg-format";

import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { buildWhereClauses } from "../clauses/where/buildWhereClauses";
import { UpdateBuilder } from "./buildUpdate";

export const updateToSql = (
    config: BaseConfiguration,
    m: string,
    builder: UpdateBuilder,
): SQLStatement => {
    const { table, where, values: update, returning } = builder;

    const frag = sql`UPDATE %I.%I AS %I\nSET`.withIdentifiers(
        table.schema,
        table.name,
        table.alias,
    );

    const fields = update.map((field) => {
        return sql`\n    %I = ${field.value}`.withIdentifiers(field.name);
    });

    frag.push(sql.splat(fields, ",\n"));

    frag.push("\nWHERE\n    ");
    frag.push(buildWhereClauses(config, table, where));

    if (returning.length > 0) {
        frag.push("\nRETURNING\n");
        frag.push(
            returning
                .map((r) =>
                    pgfmt(`    %I.%I as %I`, table.alias, r.name, r.alias),
                )
                .join(",\n"),
        );
    }
    frag.push(";\n");

    return frag;
};
