import { SQLStatement, sql } from "@casekit/sql";

import { FindBuilder } from "#builders/types.js";
import {
    joinClause,
    orderByColumn,
    selectColumn,
    tableName,
    unnestPk,
} from "./util.js";

export const findToSql = (builder: FindBuilder): SQLStatement => {
    const { table, columns, joins, lateralBy, where, orderBy, limit, offset } =
        builder;

    if (lateralBy) {
        const { primaryKeys, outerAlias, innerAlias } = lateralBy;
        return sql`
            SELECT ${sql.ident(outerAlias)}.*
            FROM (SELECT ${sql.join(primaryKeys.map(unnestPk))}) AS ${sql.ident(innerAlias)}
            JOIN LATERAL (
                SELECT ${sql.join(columns.map(selectColumn))}
                FROM ${tableName(table)}
                ${sql.join(joins.map(joinClause), "\n")}
                WHERE (${where ?? sql`1 = 1`})
                AND (${sql.join(
                    primaryKeys.map(
                        ({ column }) =>
                            sql`${sql.ident(innerAlias)}.${sql.ident(column)} = ${sql.ident(table.alias)}.${sql.ident(column)}`,
                    ),
                    " AND ",
                )})
                ${orderBy.length > 0 ? sql`ORDER BY ${sql.join(orderBy.map(orderByColumn), ", ")}` : sql``}
                ${limit ? sql`LIMIT ${limit}` : sql``}
                ${offset ? sql`OFFSET ${offset}` : sql``}
            ) ${sql.ident(outerAlias)} ON TRUE
        `;
    } else {
        return sql`
            SELECT ${sql.join(columns.map(selectColumn))}
            FROM ${tableName(table)}
            ${sql.join(joins.map(joinClause), "\n")}
            ${where ? sql`WHERE ${where}\n` : sql``}
            ${orderBy.length > 0 ? sql`ORDER BY ${sql.join(orderBy.map(orderByColumn), ", ")}` : sql``}
            ${limit ? sql`LIMIT ${limit}` : sql``}
            ${offset ? sql`OFFSET ${offset}` : sql``}
        `;
    }
};
