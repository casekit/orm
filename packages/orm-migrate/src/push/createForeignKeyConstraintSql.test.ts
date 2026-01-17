import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { orm } from "@casekit/orm";
import {
    NormalizedForeignKeyDefinition,
    NormalizedModelDefinition,
} from "@casekit/orm-config";
import { unindent } from "@casekit/unindent";

import { createForeignKeyConstraintSql } from "./createForeignKeyConstraintSql.js";

describe("createForeignKeyConstraintSql", () => {
    const db = orm({
        schema: "orm",
        models: {
            foo: {
                table: "foo",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    barId: { column: "bar_id", type: "integer" },
                    otherFooId: { column: "other_foo_id", type: "integer" },
                },
            },
            bar: {
                table: "bar",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    fooId: { column: "foo_id", type: "integer" },
                },
            },
            baz: {
                table: "baz",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    fooId: { column: "foo_id", type: "integer" },
                    barId: { column: "bar_id", type: "integer" },
                },
            },
        },
    });

    const foo = db.config.models["foo"]!;
    const baz = db.config.models["baz"]!;

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test.for<
        [
            string,
            NormalizedModelDefinition,
            NormalizedForeignKeyDefinition,
            string,
        ]
    >([
        [
            "basic foreign key",
            foo,
            {
                name: "foo_other_foo_id_fk",
                fields: ["otherFooId"],
                columns: ["other_foo_id"],
                references: {
                    model: "foo",
                    schema: "orm",
                    table: "foo",
                    fields: ["id"],
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: null,
            },
            unindent`
                ALTER TABLE "orm"."foo"
                ADD CONSTRAINT "foo_other_foo_id_fk" FOREIGN KEY ("other_foo_id") REFERENCES "orm"."foo" ("id")
            `,
        ],
        [
            "on update cascade",
            foo,
            {
                name: "foo_other_foo_id_fk",
                fields: ["otherFooId"],
                columns: ["other_foo_id"],
                references: {
                    model: "foo",
                    schema: "orm",
                    table: "foo",
                    fields: ["id"],
                    columns: ["id"],
                },
                onUpdate: "CASCADE",
                onDelete: null,
            },
            unindent`
                ALTER TABLE "orm"."foo"
                ADD CONSTRAINT "foo_other_foo_id_fk" FOREIGN KEY ("other_foo_id") REFERENCES "orm"."foo" ("id") ON UPDATE CASCADE
            `,
        ],
        [
            "on delete set null",
            foo,
            {
                name: "foo_other_foo_id_fk",
                fields: ["otherFooId"],
                columns: ["other_foo_id"],
                references: {
                    model: "foo",
                    schema: "orm",
                    table: "foo",
                    fields: ["id"],
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: "SET NULL",
            },
            unindent`
                ALTER TABLE "orm"."foo"
                ADD CONSTRAINT "foo_other_foo_id_fk" FOREIGN KEY ("other_foo_id") REFERENCES "orm"."foo" ("id") ON DELETE SET NULL
            `,
        ],
        [
            "multi-column",
            baz,
            {
                name: "baz_foo_id_bar_id_fk",
                fields: ["fooId", "barId"],
                columns: ["foo_id", "bar_id"],
                references: {
                    model: "foo",
                    schema: "orm",
                    table: "foo",
                    fields: ["otherFooId", "barId"],
                    columns: ["other_foo_id", "bar_id"],
                },
                onUpdate: "RESTRICT",
                onDelete: "SET NULL",
            },
            unindent`
                ALTER TABLE "orm"."baz"
                ADD CONSTRAINT "baz_foo_id_bar_id_fk" FOREIGN KEY ("foo_id", "bar_id") REFERENCES "orm"."foo" ("other_foo_id", "bar_id") ON DELETE SET NULL ON UPDATE RESTRICT
            `,
        ],
    ])("%s", async ([_, model, fk, expected]) => {
        const statement = createForeignKeyConstraintSql(model, fk);

        expect(statement.pretty).toEqual(expected);

        await db.transact(
            async (db) => {
                await db.query`CREATE TABLE orm.foo (id SERIAL PRIMARY KEY, bar_id INTEGER, other_foo_id INTEGER)`;
                await db.query`CREATE TABLE orm.bar (id SERIAL PRIMARY KEY, foo_id INTEGER)`;
                await db.query`CREATE TABLE orm.baz (id SERIAL PRIMARY KEY, foo_id INTEGER, bar_id INTEGER)`;
                await db.query`CREATE UNIQUE INDEX foo_other_foo_id_bar_id_key ON orm.foo (other_foo_id, bar_id)`;
                await expect(db.query(statement)).resolves.not.toThrow();
            },
            { rollback: true },
        );
    });
});
