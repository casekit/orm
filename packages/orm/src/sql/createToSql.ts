import { SQLStatement, sql } from "@casekit/sql";

import { CreateBuilder } from "#builders/types.js";
import { returnedColumn, tableName } from "./util.js";

export const createToSql = (builder: CreateBuilder): SQLStatement => {
    const { table, columns, values, onConflict, returning } = builder;

    const statement =
        columns.length > 0
            ? sql`
                INSERT INTO ${tableName(table)}
                (${columns.map(sql.ident)})
                VALUES
                ${values.map((vs) => sql`(${vs.map(sql.value)})`)}
            `
            : sql`
                INSERT INTO ${tableName(table)}
                DEFAULT VALUES
            `;

    if (onConflict?.do === "nothing") {
        statement.append`
            ON CONFLICT DO NOTHING
        `;
    }

    if (returning.length > 0) {
        statement.append`
            RETURNING ${sql.join(returning.map(returnedColumn))}
        `;
    }

    return statement;
};
