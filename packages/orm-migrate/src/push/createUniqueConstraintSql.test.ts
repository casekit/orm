import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { orm, sql } from "@casekit/orm";
import { NormalizedUniqueConstraintDefinition } from "@casekit/orm-config";
import { unindent } from "@casekit/unindent";

import { createUniqueConstraintSql } from "./createUniqueConstraintSql.js";

describe("createUniqueConstraintSql", () => {
    const db = orm({
        schema: "orm",
        models: {
            foo: {
                table: "foo",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    fooValue: { column: "foo_value", type: "text" },
                    barValue: { column: "bar_value", type: "integer" },
                },
            },
        },
    });
    const foo = db.config.models["foo"]!;

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test.for<[string, NormalizedUniqueConstraintDefinition, string]>([
        [
            "basic unique constraint",
            {
                name: "foo_foo_value_key",
                fields: ["fooValue"],
                columns: ["foo_value"],
                nullsNotDistinct: false,
                where: null,
            },
            unindent`
                CREATE UNIQUE INDEX "foo_foo_value_key" ON "orm"."foo" ("foo_value")
            `,
        ],
        [
            "nulls not distinct",
            {
                name: "foo_foo_value_key",
                fields: ["fooValue"],
                columns: ["foo_value"],
                nullsNotDistinct: true,
                where: null,
            },
            unindent`
                CREATE UNIQUE INDEX "foo_foo_value_key" ON "orm"."foo" ("foo_value") NULLS NOT DISTINCT
            `,
        ],
        [
            "where clause",
            {
                name: "foo_foo_value_key",
                fields: ["fooValue"],
                columns: ["foo_value"],
                nullsNotDistinct: false,
                where: sql`bar_value > 0`,
            },
            unindent`
                CREATE UNIQUE INDEX "foo_foo_value_key" ON "orm"."foo" ("foo_value")
                WHERE
                    bar_value > 0
            `,
        ],
        [
            "multi-column",
            {
                name: "foo_foo_value_bar_value_key",
                fields: ["fooValue", "barValue"],
                columns: ["foo_value", "bar_value"],
                nullsNotDistinct: false,
                where: null,
            },
            unindent`
                CREATE UNIQUE INDEX "foo_foo_value_bar_value_key" ON "orm"."foo" ("foo_value", "bar_value")
            `,
        ],
        [
            "multi-column with nulls not distinct and where",
            {
                name: "foo_foo_value_bar_value_key",
                fields: ["fooValue", "barValue"],
                columns: ["foo_value", "bar_value"],
                nullsNotDistinct: true,
                where: sql`bar_value > 0 AND foo_value IS NOT NULL`,
            },
            unindent`
                CREATE UNIQUE INDEX "foo_foo_value_bar_value_key" ON "orm"."foo" ("foo_value", "bar_value") NULLS NOT DISTINCT
                WHERE
                    bar_value > 0
                    AND foo_value IS NOT NULL
            `,
        ],
    ])("%s", async ([_, constraint, expected]) => {
        const statement = createUniqueConstraintSql(foo, constraint);

        expect(statement.pretty).toEqual(expected);

        await db.transact(
            async (db) => {
                await db.query`CREATE TABLE orm.foo (id SERIAL PRIMARY KEY, foo_value TEXT, bar_value INTEGER)`;
                await expect(db.query(statement)).resolves.not.toThrow();
            },
            { rollback: true },
        );
    });
});
