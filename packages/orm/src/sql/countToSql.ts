import { SQLStatement, sql } from "@casekit/sql";

import { CountBuilder } from "#builders/types.js";
import { joinClause, tableName } from "./util.js";

export const countToSql = (builder: CountBuilder): SQLStatement => {
    const { table, joins, where } = builder;

    return sql`
            SELECT count(1) AS "count"
            FROM ${tableName(table)}
            ${sql.join(joins.map(joinClause), "\n")}
            ${where ? sql`WHERE ${where}\n` : sql``}
        `;
};
