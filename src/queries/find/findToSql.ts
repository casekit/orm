import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { interleave } from "../../util/interleave";
import { buildWhereClauses } from "../clauses/where/buildWhereClauses";
import { hasConditions } from "../util/hasConditions";
import { FindBuilder } from "./types/FindBuilder";

export const findToSql = (
    config: BaseConfiguration,
    builder: FindBuilder,
): SQLStatement => {
    const frag = new SQLStatement();
    const table = builder.table;

    if (builder.lateralBy) {
        const { columns, groupTable, itemTable } = builder.lateralBy;
        frag.push(pgfmt(`SELECT %I.* FROM (\nSELECT `, itemTable));
        columns.forEach((c, index) => {
            frag.push(pgfmt(`UNNEST(ARRAY[`));

            frag.push(
                ...interleave(
                    c.values.map((v) => sql`${v}`),
                    sql`, `,
                ),
            );

            frag.push(pgfmt(`]::%I[]) AS %I`, c.type, c.column));

            if (index !== columns.length - 1) {
                frag.push(pgfmt(", "));
            }
        });
        frag.push(pgfmt(`) %I\nJOIN LATERAL (\n`, groupTable));
    }

    frag.push(
        pgfmt(
            `SELECT\n${builder.columns.map((c) => pgfmt(`    %I.%I AS %I`, c.table, c.name, c.alias)).join(",\n")}`,
        ),
    );

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
                " %I.%I %I\n    ON ",
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

    if (builder.lateralBy) {
        const { groupTable, columns } = builder.lateralBy;
        columns.forEach((c) => {
            frag.push(
                pgfmt(
                    `\n    AND %I.%I = %I.%I`,
                    table.alias,
                    c.column,
                    groupTable,
                    c.column,
                ),
            );
        });
    }

    if (builder.orderBy.length > 0) {
        frag.push(pgfmt(`\nORDER BY `));
        frag.push(
            builder.orderBy
                .map(({ table, column, direction }) =>
                    pgfmt(
                        `%I.%I ${direction === "asc" ? "ASC" : "DESC"}`,
                        table,
                        column,
                    ),
                )
                .join(", "),
        );
    }

    if (builder.limit !== undefined) {
        frag.push(sql`\nLIMIT ${builder.limit}`);
    }

    if (builder.offset !== undefined) {
        frag.push(sql`\nOFFSET ${builder.offset}`);
    }

    if (builder.for) {
        frag.push(pgfmt(`\nFOR ${builder.for.toUpperCase()}`));
    }

    if (builder.lateralBy) {
        const { itemTable } = builder.lateralBy;
        frag.push(pgfmt(`\n) %I ON TRUE`, itemTable));
    }

    return frag;
};
