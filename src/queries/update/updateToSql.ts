import pgfmt from "pg-format";

import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { buildWhereClauses } from "../where/buildWhereClauses";
import { UpdateBuilder } from "./buildUpdate";

export const updateToSql = (
    config: BaseConfiguration,
    m: string,
    builder: UpdateBuilder,
): SQLStatement => {
    const { table, where, update, returning } = builder;

    const frag = sql`UPDATE %I.%I\nSET`.withIdentifiers(
        table.schema,
        table.name,
    );

    const fields = Object.entries(update).map(([field, value]) => {
        const column = config.models[m]["columns"][field]["name"];
        return sql`\n    %I = ${value}`.withIdentifiers(column);
    });

    frag.push(sql`(${sql.splat(fields, ",\n")})`);

    frag.push("\nWHERE");
    frag.push(buildWhereClauses(config, table, where));

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
