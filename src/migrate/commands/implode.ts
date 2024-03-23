import { Orm } from "~/orm";
import { SQLStatement } from "~/sql/SQLStatement";
import { Schema } from "~/types/schema";

import { createExtensionsSql } from "../sql/createExtensionsSql";
import { createSchemasSql } from "../sql/createSchemasSql";
import { createTableSql } from "../sql/createTableSql";
import { dropTableSql } from "../sql/dropTableSql";

export const implode = async (
    db: Orm<Schema>,
    { dryRun, output }: { dryRun: boolean; output: boolean },
) => {
    const statement = new SQLStatement();

    statement.push(createSchemasSql(db));
    statement.push(createExtensionsSql(db));

    for (const model of Object.values(db.models)) {
        statement.push(dropTableSql(model));
        statement.push(createTableSql(model));
    }

    if (output) console.log(statement.text);

    if (!dryRun) {
        try {
            await db.connection.query(statement);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
};
