import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("findMany: select", () => {
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
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Lynne Tillman" }),
                        factory.user({ id: 2, name: "Stewart Home" }),
                        factory.user({ id: 3, name: "Chinua Achebe" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, name: "Lynne Tillman" },
                    { id: 2, name: "Stewart Home" },
                    { id: 3, name: "Chinua Achebe" },
                ]);
            },
            { rollback: true },
        );
    });

    test("primary key will not be returned if it is not selected", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Lynne Tillman" }),
                        factory.user({ id: 2, name: "Stewart Home" }),
                    ],
                });

                const selectedUsers = await db.findMany("user", {
                    select: ["name"],
                    orderBy: ["id"],
                });

                expect(selectedUsers).toEqual([
                    { name: "Lynne Tillman" },
                    { name: "Stewart Home" },
                ]);
            },
            { rollback: true },
        );
    });

    test("enum fields can be selected", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "user" }),
                        factory.user({ id: 2, role: "admin" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "role"],
                    orderBy: ["role"],
                });

                expect(users).toEqual([
                    { id: 2, role: "admin" },
                    { id: 1, role: "user" },
                ]);
            },
            { rollback: true },
        );
    });

    test("array fields can be selected", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "user" }),
                        factory.user({ id: 2, role: "admin" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 3,
                            tags: ["foo", "bar"],
                            authorId: 1,
                        }),
                        factory.post({
                            id: 4,
                            tags: ["baz"],
                            authorId: 1,
                        }),
                        factory.post({
                            id: 5,
                            tags: [],
                            authorId: 2,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "tags"],
                    orderBy: ["id"],
                });

                expect(posts).toEqual([
                    { id: 3, tags: ["foo", "bar"] },
                    { id: 4, tags: ["baz"] },
                    { id: 5, tags: [] },
                ]);
            },
            { rollback: true },
        );
    });

    test("json fields can be selected", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "user" }),
                        factory.user({ id: 2, role: "admin" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
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
                        factory.post({
                            id: 4,
                            authorId: 1,
                            metadata: {
                                foo: "b",
                                bar: [],
                            },
                        }),
                        factory.post({
                            id: 5,
                            authorId: 2,
                            metadata: {
                                foo: "c",
                                bar: [{ baz: "indifferent", quux: true }],
                            },
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["metadata"],
                    orderBy: ["id"],
                });

                expect(posts).toEqual([
                    {
                        metadata: {
                            foo: "a",
                            bar: [
                                { baz: "good", quux: true },
                                { baz: "bad", quux: false },
                            ],
                        },
                    },
                    { metadata: { foo: "b", bar: [] } },
                    {
                        metadata: {
                            foo: "c",
                            bar: [{ baz: "indifferent", quux: true }],
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("returns empty array when no records match", async () => {
        await db.transact(
            async (db) => {
                const users = await db.findMany("user", {
                    select: ["id", "name"],
                });
                expect(users).toEqual([]);
            },
            { rollback: true },
        );
    });

    test("handles null values in selected fields correctly", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            deletedAt: new Date("2024-01-21"),
                        }),
                        factory.user({ id: 2, deletedAt: null }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "deletedAt"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, deletedAt: new Date("2024-01-21") },
                    { id: 2, deletedAt: null },
                ]);
            },
            { rollback: true },
        );
    });

    test("can select all available fields", async () => {
        await db.transact(
            async (db) => {
                const user = factory.user({
                    id: 1,
                    name: "Test User",
                    email: "test@example.com",
                    role: "user",
                    preferences: { theme: "dark" },
                    createdAt: new Date(),
                    deletedAt: null,
                });

                await db.createOne("user", { values: user });

                const users = await db.findMany("user", {
                    select: [
                        "id",
                        "name",
                        "email",
                        "role",
                        "preferences",
                        "createdAt",
                        "deletedAt",
                    ],
                });

                expect(users[0]).toEqual(user);
            },
            { rollback: true },
        );
    });

    test("throws error when selecting from non-existent model", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    // @ts-expect-error - Testing runtime behavior
                    db.findMany("invalid", {
                        select: ["id"],
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
                    db.findMany("user", {
                        // @ts-expect-error - Testing runtime behavior
                        select: ["id", "nonexistentField"],
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
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "O'Connor" }),
                        factory.user({
                            id: 2,
                            name: "User; DROP TABLE users;",
                        }),
                        factory.user({ id: 3, name: "User with spaces" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, name: "O'Connor" },
                    { id: 2, name: "User; DROP TABLE users;" },
                    { id: 3, name: "User with spaces" },
                ]);
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

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                });

                expect(users).toEqual([{ id: 1, name: longText }]);
            },
            { rollback: true },
        );
    });
});
