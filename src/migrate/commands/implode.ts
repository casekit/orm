import { Orm } from "~/orm";
import { Schema } from "~/types/schema";

import { createSchemasSql } from "../sql/createSchemasSql";
import { createTableSql } from "../sql/createTableSql";
import { dropTableSql } from "../sql/dropTableSql";

export const implode = async (
    db: Orm<Schema>,
    { dryRun } = { dryRun: false },
) => {
    const sql: string[] = [];
    sql.push(createSchemasSql(db));

    for (const model of Object.values(db.models)) {
        sql.push(dropTableSql(model));
        sql.push(createTableSql(model));
    }

    if (!dryRun) {
        db.connection.query(sql.join("\n"));
    }
};
