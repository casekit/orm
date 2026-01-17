import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("findMany: include manyToMany", () => {
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

    test("can include manyToMany relations", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "User 1" }),
                        factory.user({ id: 2, name: "User 2" }),
                        factory.user({ id: 3, name: "User 3" }),
                    ],
                });

                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                        factory.friendship({ userId: 2, friendId: 3 }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    include: {
                        friends: {
                            select: ["id", "name"],
                            orderBy: ["id"],
                        },
                    },
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    {
                        id: 1,
                        name: "User 1",
                        friends: [
                            { id: 2, name: "User 2" },
                            { id: 3, name: "User 3" },
                        ],
                    },
                    {
                        id: 2,
                        name: "User 2",
                        friends: [{ id: 3, name: "User 3" }],
                    },
                    {
                        id: 3,
                        name: "User 3",
                        friends: [],
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("can filter included manyToMany relations", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "admin" }),
                        factory.user({ id: 2, role: "user" }),
                        factory.user({ id: 3, role: "admin" }),
                    ],
                });

                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                        factory.friendship({ userId: 2, friendId: 3 }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id"],
                    include: {
                        friends: {
                            select: ["id", "role"],
                            where: {
                                role: "admin",
                            },
                            orderBy: ["id"],
                        },
                    },
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    {
                        id: 1,
                        friends: [{ id: 3, role: "admin" }],
                    },
                    {
                        id: 2,
                        friends: [{ id: 3, role: "admin" }],
                    },
                    {
                        id: 3,
                        friends: [],
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("can limit and offset included manyToMany relations", async () => {
        await db.transact(
            async (db) => {
                // Create users with ascending creation dates
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            createdAt: new Date("2024-01-01"),
                        }),
                        factory.user({
                            id: 2,
                            createdAt: new Date("2024-01-02"),
                        }),
                        factory.user({
                            id: 3,
                            createdAt: new Date("2024-01-03"),
                        }),
                        factory.user({
                            id: 4,
                            createdAt: new Date("2024-01-04"),
                        }),
                    ],
                });

                // Make everyone friends with everyone
                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                        factory.friendship({ userId: 1, friendId: 4 }),
                        factory.friendship({ userId: 2, friendId: 3 }),
                        factory.friendship({ userId: 2, friendId: 4 }),
                        factory.friendship({ userId: 3, friendId: 4 }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id"],
                    include: {
                        friends: {
                            select: ["id"],
                            orderBy: ["id"],
                            limit: 2,
                            offset: 1,
                        },
                    },
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    {
                        id: 1,
                        friends: [{ id: 3 }, { id: 4 }],
                    },
                    {
                        id: 2,
                        friends: [{ id: 4 }],
                    },
                    {
                        id: 3,
                        friends: [],
                    },
                    {
                        id: 4,
                        friends: [],
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("can include nested relations through manyToMany", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "User 1" }),
                        factory.user({ id: 2, name: "User 2" }),
                    ],
                });

                await db.createMany("friendship", {
                    values: [factory.friendship({ userId: 1, friendId: 2 })],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 2,
                            title: "Post 1",
                        }),
                        factory.post({
                            id: 2,
                            authorId: 2,
                            title: "Post 2",
                        }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    include: {
                        friends: {
                            select: ["id", "name"],
                            include: {
                                posts: {
                                    select: ["id", "title"],
                                    orderBy: ["id"],
                                },
                            },
                            orderBy: ["id"],
                        },
                    },
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    {
                        id: 1,
                        name: "User 1",
                        friends: [
                            {
                                id: 2,
                                name: "User 2",
                                posts: [
                                    { id: 1, title: "Post 1" },
                                    { id: 2, title: "Post 2" },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2,
                        name: "User 2",
                        friends: [],
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("can order, limit and offset N:N relations with overlapping values", async () => {
        await db.transact(
            async (db) => {
                // Create users
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            name: "Alice",
                            createdAt: new Date("2024-01-01"),
                        }),
                        factory.user({
                            id: 2,
                            name: "Bob",
                            createdAt: new Date("2024-01-02"),
                        }),
                        factory.user({
                            id: 3,
                            name: "Charlie",
                            createdAt: new Date("2024-01-03"),
                        }),
                        factory.user({
                            id: 4,
                            name: "Dave",
                            createdAt: new Date("2024-01-04"),
                        }),
                        factory.user({
                            id: 5,
                            name: "Eve",
                            createdAt: new Date("2024-01-05"),
                        }),
                    ],
                });

                // Create overlapping friendship groups:
                // Group 1: Alice-Bob-Charlie
                // Group 2: Bob-Charlie-Dave
                // Group 3: Charlie-Dave-Eve
                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                        factory.friendship({ userId: 1, friendId: 4 }),

                        factory.friendship({ userId: 2, friendId: 3 }),
                        factory.friendship({ userId: 2, friendId: 4 }),
                        factory.friendship({ userId: 2, friendId: 5 }),

                        factory.friendship({ userId: 3, friendId: 4 }),
                        factory.friendship({ userId: 3, friendId: 5 }),

                        factory.friendship({ userId: 4, friendId: 5 }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    include: {
                        friends: {
                            select: ["id", "name"],
                            orderBy: [["id", "desc"]],
                            limit: 2,
                        },
                    },
                    orderBy: [["createdAt", "desc"]],
                });

                expect(users).toEqual([
                    {
                        id: 5,
                        name: "Eve",
                        friends: [],
                    },
                    {
                        id: 4,
                        name: "Dave",
                        friends: [{ id: 5, name: "Eve" }],
                    },
                    {
                        id: 3,
                        name: "Charlie",
                        friends: [
                            { id: 5, name: "Eve" },
                            { id: 4, name: "Dave" },
                        ],
                    },
                    {
                        id: 2,
                        name: "Bob",
                        friends: [
                            { id: 5, name: "Eve" },
                            { id: 4, name: "Dave" },
                        ],
                    },
                    {
                        id: 1,
                        name: "Alice",
                        friends: [
                            { id: 4, name: "Dave" },
                            { id: 3, name: "Charlie" },
                        ],
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
