import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { SQLStatement } from "../../sql";
import { QueryBuilder } from "./buildQuery";

export const queryToSql = (builder: QueryBuilder): SQLStatement => {
    const frag = new SQLStatement();
    const [table, ...joinedTables] = builder.tables;

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
                "\nJOIN %I.%I %I ON ",
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
    }
    return frag;
};
