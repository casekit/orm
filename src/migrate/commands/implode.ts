import { Orm } from "../../orm";
import { SQLStatement } from "../../sql";
import { Schema } from "../../types/schema";
import { createExtensionsSql } from "../sql/createExtensionsSql";
import { createSchemasSql } from "../sql/createSchemasSql";
import { createTableSql } from "../sql/createTableSql";
import { createUniqueConstraintSql } from "../sql/createUniqueConstraintSql";
import { dropTableSql } from "../sql/dropTableSql";

export const implode = async (
    db: Orm<Schema>,
    { dryRun, output }: { dryRun: boolean; output: boolean },
) => {
    const statement = new SQLStatement();

    statement.push(createSchemasSql(db), "\n");
    statement.push(createExtensionsSql(db), "\n");

    for (const model of Object.values(db.models)) {
        statement.push(dropTableSql(model), "\n");
        statement.push(createTableSql(model), "\n");
        for (const constraint of model.constraints.unique) {
            statement.push(createUniqueConstraintSql(model, constraint), "\n");
        }
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
