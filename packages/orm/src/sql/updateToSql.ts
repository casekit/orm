import { SQLStatement, sql } from "@casekit/sql";

import { UpdateBuilder } from "#builders/types.js";
import { returnedColumn, setClause, tableName } from "./util.js";

export const updateToSql = (builder: UpdateBuilder): SQLStatement => {
    const { table, set, where, returning } = builder;

    const statement = sql`
        UPDATE ${tableName(table)}
        SET ${set.map(setClause)}
        WHERE ${where}
    `;

    if (returning.length > 0) {
        statement.append`
            RETURNING ${sql.join(returning.map(returnedColumn))}
        `;
    }

    return statement;
};
