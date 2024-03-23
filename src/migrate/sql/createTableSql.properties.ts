import { orm } from "@casekit/orm";

import { test } from "@fast-check/vitest";
import { isEqual } from "lodash";
import pgfmt from "pg-format";
import * as gen from "~/test/gen";
import { withRollback } from "~/test/util/withRollback";

import { createSchemasSql } from "./createSchemasSql";
import { createTableSql } from "./createTableSql";

test.prop([gen.model()])("should generate valid DDL", async (model) => {
    return await withRollback(async (client) => {
        const db = orm({ models: { model } });

        // create the schema
        await client.query(createSchemasSql(db));

        // create the table
        await client.query(createTableSql(model));

        // select from the newly created table so we can check it's there
        const result = await client.query(
            pgfmt("select * from %I.%I", model.schema, model.table),
        );

        // the selected fields should match the ones defined in the model
        return isEqual(
            result.fields.map((f) => f.name),
            Object.values(model.columns).map((c) => c.name),
        );
    });
});
