import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("findMany: orderBy", () => {
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

    test("orders by a single column ascending by default", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Charlie" }),
                        factory.user({ id: 2, name: "Alice" }),
                        factory.user({ id: 3, name: "Bob" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["name"],
                });

                expect(users).toEqual([
                    { id: 2, name: "Alice" },
                    { id: 3, name: "Bob" },
                    { id: 1, name: "Charlie" },
                ]);
            },
            { rollback: true },
        );
    });

    test("orders by a single column with explicit direction", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Bob" }),
                        factory.user({ id: 3, name: "Charlie" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: [["name", "desc"]],
                });

                expect(users).toEqual([
                    { id: 3, name: "Charlie" },
                    { id: 2, name: "Bob" },
                    { id: 1, name: "Alice" },
                ]);
            },
            { rollback: true },
        );
    });

    test("orders by multiple columns", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "admin", name: "Charlie" }),
                        factory.user({ id: 2, role: "user", name: "Alice" }),
                        factory.user({ id: 3, role: "admin", name: "Bob" }),
                        factory.user({ id: 4, role: "user", name: "Bob" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name", "role"],
                    orderBy: [["role", "desc"], "name"],
                });

                expect(users).toEqual([
                    { id: 2, role: "user", name: "Alice" },
                    { id: 4, role: "user", name: "Bob" },
                    { id: 3, role: "admin", name: "Bob" },
                    { id: 1, role: "admin", name: "Charlie" },
                ]);
            },
            { rollback: true },
        );
    });

    test("handles null values in ordering", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            name: "Alice",
                            deletedAt: new Date("2024-01-01"),
                        }),
                        factory.user({ id: 2, name: "Bob", deletedAt: null }),
                        factory.user({
                            id: 3,
                            name: "Charlie",
                            deletedAt: new Date("2023-12-31"),
                        }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name", "deletedAt"],
                    orderBy: ["deletedAt"],
                });

                expect(users).toEqual([
                    {
                        id: 3,
                        name: "Charlie",
                        deletedAt: new Date("2023-12-31"),
                    },
                    { id: 1, name: "Alice", deletedAt: new Date("2024-01-01") },
                    { id: 2, name: "Bob", deletedAt: null },
                ]);
            },
            { rollback: true },
        );
    });

    test("orders json fields", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, preferences: { theme: "dark" } }),
                        factory.user({
                            id: 2,
                            preferences: { theme: "light" },
                        }),
                        factory.user({ id: 3, preferences: { theme: "auto" } }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "preferences"],
                    orderBy: ["preferences"],
                });

                expect(users).toEqual([
                    { id: 3, preferences: { theme: "auto" } },
                    { id: 1, preferences: { theme: "dark" } },
                    { id: 2, preferences: { theme: "light" } },
                ]);
            },
            { rollback: true },
        );
    });

    test("throws error when ordering by non-existent field", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.findMany("user", {
                        select: ["id"],
                        // @ts-expect-error - Testing runtime behavior
                        orderBy: ["nonexistentField"],
                    }),
                ).rejects.toThrow(
                    'Field "nonexistentField" not found in model "user"',
                );
            },
            { rollback: true },
        );
    });

    test("orders by array fields", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Charlie" }),
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            tags: ["dev", "javascript"],
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            tags: ["dev"],
                            authorId: 1,
                        }),
                        factory.post({
                            id: 3,
                            tags: ["javascript", "typescript"],
                            authorId: 1,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "tags"],
                    orderBy: ["tags"],
                });

                expect(posts).toEqual([
                    { id: 2, tags: ["dev"] },
                    { id: 1, tags: ["dev", "javascript"] },
                    { id: 3, tags: ["javascript", "typescript"] },
                ]);
            },
            { rollback: true },
        );
    });

    test("orders by N:1 relation field ascending", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Charlie" }),
                        factory.user({ id: 2, name: "Alice" }),
                        factory.user({ id: 3, name: "Bob" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            title: "Post 1",
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            title: "Post 2",
                            authorId: 2,
                        }),
                        factory.post({
                            id: 3,
                            title: "Post 3",
                            authorId: 3,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "title"],
                    include: { author: { select: ["name"] } },
                    orderBy: ["author.name"],
                });

                expect(posts).toEqual([
                    { id: 2, title: "Post 2", author: { name: "Alice" } },
                    { id: 3, title: "Post 3", author: { name: "Bob" } },
                    { id: 1, title: "Post 1", author: { name: "Charlie" } },
                ]);
            },
            { rollback: true },
        );
    });

    test("orders by N:1 relation field descending", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Charlie" }),
                        factory.user({ id: 2, name: "Alice" }),
                        factory.user({ id: 3, name: "Bob" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            title: "Post 1",
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            title: "Post 2",
                            authorId: 2,
                        }),
                        factory.post({
                            id: 3,
                            title: "Post 3",
                            authorId: 3,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "title"],
                    include: { author: { select: ["name"] } },
                    orderBy: [["author.name", "desc"]],
                });

                expect(posts).toEqual([
                    { id: 1, title: "Post 1", author: { name: "Charlie" } },
                    { id: 3, title: "Post 3", author: { name: "Bob" } },
                    { id: 2, title: "Post 2", author: { name: "Alice" } },
                ]);
            },
            { rollback: true },
        );
    });

    test("orders by mix of direct and N:1 relation fields", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Alice" }),
                        factory.user({ id: 3, name: "Bob" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            title: "First Post",
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            title: "Another Post",
                            authorId: 2,
                        }),
                        factory.post({
                            id: 3,
                            title: "Last Post",
                            authorId: 3,
                        }),
                        factory.post({
                            id: 4,
                            title: "New Post",
                            authorId: 1,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "title"],
                    include: { author: { select: ["name"] } },
                    orderBy: [
                        ["author.name", "asc"],
                        ["title", "desc"],
                    ],
                });

                expect(posts).toEqual([
                    { id: 4, title: "New Post", author: { name: "Alice" } },
                    { id: 1, title: "First Post", author: { name: "Alice" } },
                    { id: 2, title: "Another Post", author: { name: "Alice" } },
                    { id: 3, title: "Last Post", author: { name: "Bob" } },
                ]);
            },
            { rollback: true },
        );
    });
});
