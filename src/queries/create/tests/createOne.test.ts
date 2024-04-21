import pg from "pg";
import * as uuid from "uuid";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { ModelDefinition, orm } from "../../..";
import { createTableSql } from "../../../migrate/sql/createTableSql";
import { sql } from "../../../sql";
import { db } from "../../../test/db";

describe("createOne", () => {
    test("it inserts records into the database", async () => {
        await db.transact(
            async (db) => {
                const userId = uuid.v4();
                const tenantId = uuid.v4();
                const postId = uuid.v4();
                await db.createOne("tenant", {
                    values: {
                        id: tenantId,
                        name: "popovapark",
                    },
                });
                await db.createOne("user", {
                    values: {
                        id: userId,
                        username: "russell",
                    },
                });
                const result = await db.createOne("post", {
                    values: {
                        id: postId,
                        authorId: userId,
                        tenantId: tenantId,
                        title: "hello it me",
                        content: "i'm writing a post",
                    },
                });

                expect(result).toEqual(1);

                const rows = await db.findMany("post", {
                    select: ["id", "title"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0]).toEqual(
                    expect.objectContaining({
                        id: postId,
                        title: "hello it me",
                    }),
                );
            },
            { rollback: true },
        );
    });

    test("columns of type serial do not need to be specified", async () => {
        const baz = {
            columns: {
                id: { type: "serial", zodSchema: z.coerce.number() },
                big: { type: "bigserial", zodSchema: z.coerce.number() },
                small: { type: "smallserial", zodSchema: z.coerce.number() },
            },
        } as const satisfies ModelDefinition;
        await orm({
            schema: "casekit",
            models: { baz },
            relations: { baz: {} },
            pool: new pg.Pool(),
        }).transact(
            async (db) => {
                await db.connection.query(createTableSql(db.models.baz));

                await db.createOne("baz", {
                    values: {},
                });

                const rows = await db.findMany("baz", {
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
        const baz = {
            columns: {
                id: {
                    type: "uuid",
                    zodSchema: z.string().uuid(),
                    default: sql`uuid_generate_v4()`,
                },
                name: { type: "text", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;
        await orm({
            schema: "casekit",
            models: { baz },
            relations: { baz: {} },
            pool: new pg.Pool(),
        }).transact(
            async (db) => {
                await db.connection.query(createTableSql(db.models.baz));

                await db.createOne("baz", {
                    values: { name: "hello" },
                });

                const rows = await db.findMany("baz", {
                    select: ["id", "name"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0].id).toBeTypeOf("string");
                expect(rows[0].name).toEqual("hello");
            },
            { rollback: true },
        );
    });
    test("columns that are provided by middleware do not need to be specified", async () => {
        const baz = {
            columns: {
                id: {
                    type: "uuid",
                    zodSchema: z.string().uuid(),
                    provided: true,
                },
                name: { type: "text", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        await orm({
            schema: "casekit",
            models: { baz },
            relations: { baz: {} },
            pool: new pg.Pool(),
            middleware: [
                {
                    create: {
                        values: (values) => ({ id: uuid.v4(), ...values }),
                    },
                },
            ],
        }).transact(
            async (db) => {
                await db.connection.query(createTableSql(db.models.baz));

                await db.createOne("baz", {
                    values: { name: "hello" },
                });

                const rows = await db.findMany("baz", {
                    select: ["id", "name"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0].id).toBeTypeOf("string");
                expect(rows[0].name).toEqual("hello");
            },
            { rollback: true },
        );
    });

    test("conflicts can be ignored", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", { values: { username: "russell" } });

                // creating a duplicate user should throw an error
                await expect(
                    db.transact(async (db) => {
                        return db.createOne("user", {
                            values: { username: "russell" },
                        });
                    }),
                ).rejects.toThrow(
                    'duplicate key value violates unique constraint "user_username_idx"',
                );

                // but if we ignore the conflict, it should work
                const result = await db.createOne("user", {
                    values: { username: "russell" },
                    onConflict: { do: "nothing" },
                });
                expect(result).toEqual(0);
            },
            { rollback: true },
        );
    });
});
