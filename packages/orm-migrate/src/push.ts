import { Orm } from "@casekit/orm";
import { toSentence } from "@casekit/toolbox";

import { createExtensionsSql } from "#push/createExtensionSql.js";
import { createForeignKeyConstraintSql } from "#push/createForeignKeyConstraintSql.js";
import { createSchemaSql } from "#push/createSchemaSql.js";
import { createTableSql } from "#push/createTableSql.js";
import { createUniqueConstraintSql } from "#push/createUniqueConstraintSql.js";

export const push = async (db: Orm) => {
    const schemas = new Set(
        Object.values(db.config.models).map((model) => model.schema),
    );
    console.log(`Pushing schemas ${toSentence(schemas)} to database`);

    await db.transact(async (db) => {
        for (const schema of schemas.values()) {
            console.log(` - Creating schema "${schema}"`);
            await db.query(createSchemaSql(schema));
        }
        for (const extension of db.config.extensions) {
            console.log(` - Creating extension "${extension}"`);
            for (const schema of schemas) {
                await db.query(createExtensionsSql(schema, extension));
            }

            if (!schemas.has("public")) {
                await db.query(createExtensionsSql("public", extension));
            }
        }
        for (const model of Object.values(db.config.models)) {
            console.log(` - Creating table "${model.schema}"."${model.table}"`);
            await db.query(createTableSql(model));
        }
        for (const model of Object.values(db.config.models)) {
            for (const fk of model.foreignKeys) {
                console.log(
                    ` - Creating foreign key constraint "${fk.name}" ON "${model.table}"`,
                );
                await db.query(createForeignKeyConstraintSql(model, fk));
            }
        }
        for (const model of Object.values(db.config.models)) {
            for (const constraint of model.uniqueConstraints) {
                console.log(
                    ` - Creating unique constraint "${constraint.name}" ON "${model.schema}"."${model.table}"`,
                );
                await db.query(createUniqueConstraintSql(model, constraint));
            }
        }
    });
};
