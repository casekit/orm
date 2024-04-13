import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { isNonEmptyClause } from "../util/isNonEmptyClause";
import { buildWhereClauses } from "../where/buildWhereClauses";
import { CountBuilder } from "./CountBuilder";

export const countToSql = (
    config: BaseConfiguration,
    builder: CountBuilder,
): SQLStatement => {
    const [table, ...joinedTables] = builder.tables;

    const frag = sql`SELECT count(1) as "count"`;

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
        if (isNonEmptyClause(joinedTable.where)) {
            frag.push(
                sql`\n    AND ${buildWhereClauses(config, joinedTable, joinedTable.where)}`,
            );
        }
    }

    frag.push(sql`\nWHERE 1 = 1`);

    if (isNonEmptyClause(table.where)) {
        frag.push(
            sql`\n    AND ${buildWhereClauses(config, table, table.where)}`,
        );
    }

    return frag;
};
