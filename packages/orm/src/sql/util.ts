import { SQLStatement, sql } from "@casekit/sql";

import {
    Column,
    Join,
    LateralJoin,
    OrderBy,
    ReturnedColumn,
    SelectedColumn,
    Table,
} from "#builders/types.js";

export const tableName = (table: Table) => {
    return sql`${sql.ident(table.schema)}.${sql.ident(table.name)} AS ${sql.ident(table.alias)}`;
};

export const columnName = (column: Column) => {
    return sql`${sql.ident(column.table)}.${sql.ident(column.name)}`;
};

export const selectColumn = ({ table, name, alias }: SelectedColumn) => {
    return sql`${sql.ident(table)}.${sql.ident(name)} AS ${sql.ident(alias)}`;
};

export const returnedColumn = ({ name, alias }: ReturnedColumn) => {
    return sql`${sql.ident(name)} AS ${sql.ident(alias)}`;
};

export const unnestPk = (pk: LateralJoin["primaryKeys"][number]) => {
    return sql`UNNEST(ARRAY[${sql.join(pk.values.map((v) => sql`${v}`))}]::${new SQLStatement(pk.type)}[]) AS ${sql.ident(pk.column)}`;
};

export const setClause = ([column, value]: [string, unknown]) => {
    return sql`${sql.ident(column)} = ${sql.value(value)}`;
};

export const joinClause = (join: Join): SQLStatement => {
    if (join.subquery) {
        // Build subquery with nested joins
        const subquerySql: SQLStatement = sql`
            SELECT ${sql.join(join.subquery.columns.map(selectColumn))}
            FROM ${tableName(join.table)}
            ${sql.join(join.subquery.joins.map(joinClause), "\n")}
            ${join.where ? sql`WHERE ${join.where}` : sql``}
        `;

        const pkClauses = join.columns.map(
            ({ from, to }) =>
                sql`${columnName(from)} = ${sql.ident(to.table)}.${sql.ident(to.name)}`,
        );

        return sql`
            ${join.type === "LEFT" ? sql`LEFT JOIN` : sql`JOIN`}
            (${subquerySql}) AS ${sql.ident(join.subquery.alias)}
            ON ${sql.join(pkClauses, " AND ")}
        `;
    } else {
        const pkClauses = join.columns.map(
            ({ from, to }) => sql`${columnName(from)} = ${columnName(to)}`,
        );
        const clauses = join.where ? [...pkClauses, join.where] : pkClauses;
        return sql`
            ${join.type === "LEFT" ? sql`LEFT JOIN` : sql`JOIN`}
            ${tableName(join.table)} ON ${sql.join(clauses, " AND ")}
        `;
    }
};

export const orderByColumn = (orderByColumn: OrderBy) => {
    return sql`
        ${columnName(orderByColumn.column)}
        ${orderByColumn.direction === "ASC" ? sql`ASC` : sql`DESC`}
    `;
};
