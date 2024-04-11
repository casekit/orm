import { isEmpty } from "lodash-es";
import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { interleave } from "../../util/interleave";
import { buildWhereClauses } from "../where/buildWhereClauses";
import { FindBuilder } from "./FindBuilder";

export const findToSql = (
    config: BaseConfiguration,
    builder: FindBuilder,
): SQLStatement => {
    const frag = new SQLStatement();
    const [table, ...joinedTables] = builder.tables;

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

    frag.push(pgfmt(`\nFROM %I.%I %I`, table.schema, table.name, table.alias));

    for (const joinedTable of joinedTables) {
        if (!joinedTable.joins)
            throw new OrmError("Joined table without join clauses", {
                data: builder,
            });
        frag.push(
            pgfmt(
                "\nJOIN %I.%I %I\n    ON ",
                joinedTable.schema,
                joinedTable.name,
                joinedTable.alias,
            ),
        );
        frag.push(
            joinedTable.joins
                .flatMap((join) => {
                    if (join.from.columns.length !== join.to.columns.length) {
                        throw new OrmError(
                            "Number of foreign keys doesn't match number of primary keys in join",
                            { data: builder },
                        );
                    }

                    return join.from.columns.map((from, i) =>
                        pgfmt(
                            "%I.%I = %I.%I",
                            table.alias,
                            from,
                            joinedTable.alias,
                            join.to.columns[i],
                        ),
                    );
                })
                .join(" AND "),
        );
        if (joinedTable.where) {
            frag.push(
                sql`\n    AND ${buildWhereClauses(config, joinedTable, joinedTable.where)}`,
            );
        }
    }

    frag.push(sql`\nWHERE 1 = 1`);

    if (!isEmpty(table.where)) {
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

    if (builder.lateralBy) {
        const { itemTable } = builder.lateralBy;
        frag.push(pgfmt(`\n) %I ON TRUE`, itemTable));
    }

    return frag;
};
