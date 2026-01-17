import { SQLStatement, sql } from "@casekit/sql";

import { DeleteBuilder } from "#builders/types.js";
import { returnedColumn, tableName } from "./util.js";

export const deleteToSql = (builder: DeleteBuilder): SQLStatement => {
    const { table, where, returning } = builder;

    const statement = sql`
        DELETE FROM ${tableName(table)}
        WHERE ${where}
    `;

    if (returning.length > 0) {
        statement.append`
            RETURNING ${sql.join(returning.map(returnedColumn))}
        `;
    }

    return statement;
};
