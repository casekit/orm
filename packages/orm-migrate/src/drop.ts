import { Orm, sql } from "@casekit/orm";

export const drop = async (db: Orm) => {
    const schemas = new Set(
        Object.values(db.config.models).map((model) => model.schema),
    );

    await db.transact(async (db) => {
        for (const schema of schemas.values()) {
            console.log(` - Dropping schema ${schema}`);
            await db.query`
                DROP SCHEMA IF EXISTS ${sql.ident(schema)} CASCADE;
            `;
        }
    });
};
