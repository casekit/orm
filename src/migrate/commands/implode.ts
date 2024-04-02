import { Orm } from "../../orm";
import { SQLStatement } from "../../sql";
import { ModelDefinitions } from "../../types/schema/definition/ModelDefinitions";
import { createExtensionsSql } from "../sql/createExtensionsSql";
import { createForeignKeyConstraintSql } from "../sql/createForeignKeyConstraintSql";
import { createSchemasSql } from "../sql/createSchemasSql";
import { createTableSql } from "../sql/createTableSql";
import { createUniqueConstraintSql } from "../sql/createUniqueConstraintSql";
import { dropSchemasSql } from "../sql/dropSchemasSql";

export const implode = async <Models extends ModelDefinitions>(
    db: Orm<Models>,
    { dryRun, output }: { dryRun: boolean; output: boolean },
) => {
    const statement = new SQLStatement();

    statement.push(dropSchemasSql(db), "\n");
    statement.push(createSchemasSql(db), "\n");
    statement.push(createExtensionsSql(db), "\n");

    for (const model of Object.values(db.models)) {
        statement.push(createTableSql(model), "\n");
        for (const constraint of model.uniqueConstraints) {
            statement.push(createUniqueConstraintSql(model, constraint), "\n");
        }
    }

    for (const model of Object.values(db.models)) {
        for (const foreignKey of model.foreignKeys) {
            statement.push(
                createForeignKeyConstraintSql(model, foreignKey),
                "\n",
            );
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
