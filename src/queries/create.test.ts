import * as uuid from "uuid";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { createModel, orm } from "..";
import { createTableSql } from "../migrate/sql/createTableSql";
import { sql } from "../sql";
import { config, models } from "../test/fixtures";

describe("create", () => {
    test("it inserts records into the database", async () => {
        await orm({ config, models }).transact(
            async (db) => {
                const id = uuid.v4();
                const result = await db.create("post", {
                    data: {
                        id: id,
                        title: "hello it me",
                        content: "i'm writing a post",
                        authorId: uuid.v4(),
                    },
                });

                expect(result).toEqual(true);

                const rows = await db.findMany("post", {
                    select: ["id", "title"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0]).toEqual(
                    expect.objectContaining({
                        id: id,
                        title: "hello it me",
                    }),
                );
            },
            { rollback: true },
        );
    });

    test("columns of type serial do not need to be specified", async () => {
        const foo = createModel({
            columns: {
                id: { type: "serial", schema: z.coerce.number() },
                big: { type: "bigserial", schema: z.coerce.number() },
                small: { type: "smallserial", schema: z.coerce.number() },
            },
        });
        await orm({ config, models: { foo } }).transact(
            async (db) => {
                db.connection.query(createTableSql(db.models.foo));

                await db.create("foo", {
                    data: {},
                });

                const rows = await db.findMany("foo", {
                    select: ["id", "big", "small"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0].id).toBeTypeOf("number");
                expect(rows[0].big).toBeTypeOf("number");
                expect(rows[0].small).toBeTypeOf("number");
            },
            { rollback: true },
        );
    });

    test("columns with default values do not need to be specified", async () => {
        const foo = createModel({
            columns: {
                id: {
                    type: "uuid",
                    schema: z.string().uuid(),
                    default: sql`uuid_generate_v4()`,
                },
                name: { type: "text", schema: z.string() },
            },
        });
        await orm({ config, models: { foo } }).transact(
            async (db) => {
                db.connection.query(createTableSql(db.models.foo));

                await db.create("foo", {
                    data: { name: "hello" },
                });

                const rows = await db.findMany("foo", {
                    select: ["id", "name"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0].id).toBeTypeOf("string");
                expect(rows[0].name).toEqual("hello");
            },
            { rollback: true },
        );
    });
});
