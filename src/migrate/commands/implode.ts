import { Orm } from "~/orm";
import { Schema } from "~/types/schema";
import { SQLFragment } from "~/util/SQLFragment";

import { createExtensionsSql } from "../sql/createExtensionsSql";
import { createSchemasSql } from "../sql/createSchemasSql";
import { createTableSql } from "../sql/createTableSql";
import { dropTableSql } from "../sql/dropTableSql";

export const implode = async (
    db: Orm<Schema>,
    { dryRun, output }: { dryRun: boolean; output: boolean },
) => {
    const sql = new SQLFragment();
    sql.push(createSchemasSql(db));

    const extensionsSql = createExtensionsSql(db);
    if (extensionsSql) sql.push(extensionsSql);

    for (const model of Object.values(db.models)) {
        sql.push(dropTableSql(model));
        sql.push(createTableSql(model));
    }

    if (output) {
        console.log(sql.toQuery()[0]);
    }
    if (!dryRun) {
        try {
            await db.connection.query(...sql.toQuery());
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
};
