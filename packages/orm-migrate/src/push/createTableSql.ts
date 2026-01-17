import { SQLStatement, sql } from "@casekit/orm";
import { NormalizedModelDefinition } from "@casekit/orm-config";

import { arrayToSqlArray } from "#push/arrayToSqlArray.js";

export const createTableSql = (
    model: NormalizedModelDefinition,
): SQLStatement => {
    const fields = Object.values(model.fields);
    const primaryKey = model.primaryKey;

    const statement = sql`CREATE TABLE IF NOT EXISTS ${sql.ident(model.schema)}.${sql.ident(model.table)} (\n`;

    fields.forEach((field, i) => {
        statement.append`  ${sql.ident(field.column)} `;

        // dangerously appending raw SQL here, but we need to,
        // and this only comes from user-defined schemas, so should be ok
        statement.push(new SQLStatement(field.type));

        if (!field.nullable) statement.append` NOT NULL`;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- let's do this check to be safe
        if (field.default !== null || field.default === undefined) {
            statement.append` DEFAULT `;

            if (field.default instanceof SQLStatement) {
                statement.push(field.default as SQLStatement);
            } else if (typeof field.default === "string") {
                statement.push(sql.literal(field.default));
            } else if (Array.isArray(field.default)) {
                statement.push(sql.literal(arrayToSqlArray(field.default)));
            } else {
                statement.push(sql.literal(JSON.stringify(field.default)));
            }
        }

        if (i < fields.length - 1) statement.append`,\n`;
    });

    if (primaryKey.length > 0) {
        statement.append`,\n  PRIMARY KEY (${sql.join(
            primaryKey.map((pk) => sql.ident(pk.column)),
            ", ",
        )})`;
    }

    statement.append`\n);`;

    return statement;
};
