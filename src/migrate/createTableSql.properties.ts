import { test } from "@fast-check/vitest";
import { isEqual } from "lodash";
import pgfmt from "pg-format";
import * as gen from "~/test/gen";
import { withRollback } from "~/test/util/withRollback";

import { createTableSql } from "./createTableSql";

test.prop([gen.model()])("should generate valid DDL", async (model) => {
    return await withRollback(async (client) => {
        // clear up anything hanging around from a previous test
        await client.query(
            pgfmt("DROP TABLE IF EXISTS casekit.%I", model.table),
        );

        // generate and run the ddl
        const sql = createTableSql(model);
        await client.query(sql);

        // select from the newly created table so we can check it's there
        const result = await client.query(
            pgfmt("select * from casekit.%I", model.table),
        );

        // the selected fields should match the ones defined in the model
        return isEqual(
            result.fields.map((f) => f.name),
            Object.values(model.columns).map((c) => c.name),
        );
    });
});
