import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { buildWhereClauses } from "../clauses/where/buildWhereClauses";
import { hasConditions } from "../util/hasConditions";
import { CountBuilder } from "./types/CountBuilder";

export const countToSql = (
    config: BaseConfiguration,
    builder: CountBuilder,
): SQLStatement => {
    const table = builder.table;

    const frag = sql`SELECT count(1) as "count"`;

    frag.push(pgfmt(`\nFROM %I.%I %I`, table.schema, table.table, table.alias));

    for (const join of table.joins ?? []) {
        if (join.from.columns.length !== join.to.columns.length) {
            throw new OrmError(
                "Number of foreign keys doesn't match number of primary keys in join",
                { data: builder },
            );
        }

        frag.push(join.type === "left" ? "\nLEFT JOIN" : "\nJOIN");
        frag.push(
            pgfmt(
                "\n %I.%I %I\n    ON ",
                join.to.schema,
                join.to.table,
                join.to.alias,
            ),
        );
        frag.push(
            join.from.columns
                .map((from, i) =>
                    pgfmt(
                        "%I.%I = %I.%I",
                        join.from.alias,
                        from,
                        join.to.alias,
                        join.to.columns[i],
                    ),
                )
                .join(" AND "),
        );
        if (hasConditions(join.where)) {
            frag.push(
                sql`\n    AND ${buildWhereClauses(config, join.to, join.where)}`,
            );
        }
    }

    frag.push(sql`\nWHERE 1 = 1`);

    if (hasConditions(table.where)) {
        frag.push(
            sql`\n    AND ${buildWhereClauses(config, table, table.where)}`,
        );
    }

    return frag;
};
