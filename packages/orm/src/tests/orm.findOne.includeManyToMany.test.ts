import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("findOne: include manyToMany", () => {
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

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                    include: {
                        friends: {
                            select: ["id", "name"],
                            orderBy: ["id"],
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    name: "User 1",
                    friends: [
                        { id: 2, name: "User 2" },
                        { id: 3, name: "User 3" },
                    ],
                });
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

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        friends: {
                            select: ["id", "role"],
                            where: {
                                role: "admin",
                            },
                            orderBy: ["id"],
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    friends: [{ id: 3, role: "admin" }],
                });
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

                // Create friendships
                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                        factory.friendship({ userId: 1, friendId: 4 }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        friends: {
                            select: ["id"],
                            orderBy: ["id"],
                            limit: 2,
                            offset: 1,
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    friends: [{ id: 3 }, { id: 4 }],
                });
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

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
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
                });

                expect(user).toEqual({
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
                });
            },
            { rollback: true },
        );
    });

    test("handles not found case appropriately", async () => {
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

                // Should throw when user doesn't exist
                await expect(
                    db.findOne("user", {
                        select: ["id"],
                        where: { id: 999 },
                        include: {
                            friends: {
                                select: ["id"],
                            },
                        },
                    }),
                ).rejects.toThrow();
            },
            { rollback: true },
        );
    });

    test("can include manyToMany relations with complex ordering", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            name: "User 1",
                            createdAt: new Date("2024-01-01"),
                        }),
                        factory.user({
                            id: 2,
                            name: "User 2",
                            createdAt: new Date("2024-01-03"),
                        }),
                        factory.user({
                            id: 3,
                            name: "User 3",
                            createdAt: new Date("2024-01-02"),
                        }),
                    ],
                });

                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                    include: {
                        friends: {
                            select: ["id", "name", "createdAt"],
                            orderBy: [["createdAt", "desc"]],
                        },
                    },
                });

                // Use toEqual with a complete object that specifies the exact expected order
                expect(user).toEqual({
                    id: 1,
                    name: "User 1",
                    friends: [
                        {
                            id: 2,
                            name: "User 2",
                            createdAt: expect.any(Date),
                        },
                        {
                            id: 3,
                            name: "User 3",
                            createdAt: expect.any(Date),
                        },
                    ],
                });
            },
            { rollback: true },
        );
    });
});
