import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("findOne: select", () => {
    const { db, logger, factory } = createTestDB();

    beforeEach(() => {
        logger.clear();
    });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test("selected fields are returned", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Lynne Tillman" }),
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                });

                expect(user).toEqual({ id: 1, name: "Lynne Tillman" });
            },
            { rollback: true },
        );
    });

    test("primary key will not be returned if it is not selected", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Lynne Tillman" }),
                });

                const selectedUser = await db.findOne("user", {
                    select: ["name"],
                    where: { id: 1 },
                });

                expect(selectedUser).toEqual({ name: "Lynne Tillman" });
            },
            { rollback: true },
        );
    });

    test("enum fields can be selected", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, role: "admin" }),
                });

                const user = await db.findOne("user", {
                    select: ["id", "role"],
                    where: { id: 1 },
                });

                expect(user).toEqual({ id: 1, role: "admin" });
            },
            { rollback: true },
        );
    });

    test("array fields can be selected", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, role: "user" }),
                });

                await db.createOne("post", {
                    values: factory.post({
                        id: 3,
                        tags: ["foo", "bar"],
                        authorId: 1,
                    }),
                });

                const post = await db.findOne("post", {
                    select: ["id", "tags"],
                    where: { id: 3 },
                });

                expect(post).toEqual({ id: 3, tags: ["foo", "bar"] });
            },
            { rollback: true },
        );
    });

    test("json fields can be selected", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, role: "user" }),
                });

                await db.createOne("post", {
                    values: factory.post({
                        id: 3,
                        authorId: 1,
                        metadata: {
                            foo: "a",
                            bar: [
                                { baz: "good", quux: true },
                                { baz: "bad", quux: false },
                            ],
                        },
                    }),
                });

                const post = await db.findOne("post", {
                    select: ["metadata"],
                    where: { id: 3 },
                });

                expect(post).toEqual({
                    metadata: {
                        foo: "a",
                        bar: [
                            { baz: "good", quux: true },
                            { baz: "bad", quux: false },
                        ],
                    },
                });
            },
            { rollback: true },
        );
    });

    test("throws error when no records match criteria", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.findOne("user", {
                        select: ["id", "name"],
                        where: { id: 999 },
                    }),
                ).rejects.toThrow("Expected one row, but found none");
            },
            { rollback: true },
        );
    });

    test("handles null values in selected fields correctly", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({
                        id: 1,
                        deletedAt: null,
                    }),
                });

                const user = await db.findOne("user", {
                    select: ["id", "deletedAt"],
                    where: { id: 1 },
                });

                expect(user).toEqual({
                    id: 1,
                    deletedAt: null,
                });
            },
            { rollback: true },
        );
    });

    test("can select all available fields", async () => {
        await db.transact(
            async (db) => {
                const userData = factory.user({
                    id: 1,
                    name: "Test User",
                    email: "test@example.com",
                    role: "user",
                    preferences: { theme: "dark" },
                    createdAt: new Date("2024-01-01"),
                    deletedAt: null,
                });

                await db.createOne("user", { values: userData });

                const user = await db.findOne("user", {
                    select: [
                        "id",
                        "name",
                        "email",
                        "role",
                        "preferences",
                        "createdAt",
                        "deletedAt",
                    ],
                    where: { id: 1 },
                });

                expect(user).toEqual(userData);
            },
            { rollback: true },
        );
    });

    test("throws error when selecting from non-existent model", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    // @ts-expect-error - Testing runtime behavior
                    db.findOne("invalid", {
                        select: ["id"],
                        where: { id: 1 },
                    }),
                ).rejects.toThrow(`Model "invalid" not found`);
            },
            { rollback: true },
        );
    });

    test("throws error when selecting non-existent field", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.findOne("user", {
                        // @ts-expect-error - Testing runtime behavior
                        select: ["id", "nonexistentField"],
                        where: { id: 1 },
                    }),
                ).rejects.toThrow(
                    `Field "nonexistentField" not found in model "user"`,
                );
            },
            { rollback: true },
        );
    });

    test("handles special characters in selected field values", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({
                        id: 1,
                        name: "O'Connor; DROP TABLE users;",
                    }),
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                });

                expect(user).toEqual({
                    id: 1,
                    name: "O'Connor; DROP TABLE users;",
                });
            },
            { rollback: true },
        );
    });

    test("handles large text values in selected fields", async () => {
        await db.transact(
            async (db) => {
                const longText = "a".repeat(10000);
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: longText }),
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                });

                expect(user).toEqual({ id: 1, name: longText });
            },
            { rollback: true },
        );
    });
});
