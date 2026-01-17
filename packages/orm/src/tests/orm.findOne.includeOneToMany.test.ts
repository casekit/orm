import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { $not } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("findOne: include oneToMany", () => {
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

    test("can include oneToMany relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "User 1" }),
                    returning: ["id"],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            title: "Post 1",
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            title: "Post 2",
                        }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                    include: {
                        posts: {
                            select: ["id", "title"],
                            orderBy: ["id"],
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    name: "User 1",
                    posts: [
                        { id: 1, title: "Post 1" },
                        { id: 2, title: "Post 2" },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("can filter included oneToMany relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                    returning: ["id"],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            publishedAt: new Date("2024-01-01"),
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            publishedAt: null,
                        }),
                        factory.post({
                            id: 3,
                            authorId: 1,
                            publishedAt: new Date("2024-01-02"),
                        }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        posts: {
                            select: ["id", "publishedAt"],
                            where: {
                                publishedAt: { [$not]: null },
                            },
                            orderBy: ["id"],
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    posts: [
                        { id: 1, publishedAt: new Date("2024-01-01") },
                        { id: 3, publishedAt: new Date("2024-01-02") },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("can order included oneToMany relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                    returning: ["id"],
                });

                // Create posts with different creation dates
                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            createdAt: new Date("2024-01-01"),
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            createdAt: new Date("2024-01-03"),
                        }),
                        factory.post({
                            id: 3,
                            authorId: 1,
                            createdAt: new Date("2024-01-02"),
                        }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        posts: {
                            select: ["id", "createdAt"],
                            orderBy: [["createdAt", "desc"]],
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    posts: [
                        { id: 2, createdAt: new Date("2024-01-03") },
                        { id: 3, createdAt: new Date("2024-01-02") },
                        { id: 1, createdAt: new Date("2024-01-01") },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("can limit and offset included oneToMany relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                    returning: ["id"],
                });

                // Create multiple posts
                await db.createMany("post", {
                    values: [
                        factory.post({ id: 1, authorId: 1 }),
                        factory.post({ id: 2, authorId: 1 }),
                        factory.post({ id: 3, authorId: 1 }),
                        factory.post({ id: 4, authorId: 1 }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        posts: {
                            select: ["id"],
                            orderBy: ["id"],
                            limit: 2,
                            offset: 1,
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    posts: [{ id: 2 }, { id: 3 }],
                });
            },
            { rollback: true },
        );
    });

    test("can include nested relations in oneToMany relations", async () => {
        await db.transact(
            async (db) => {
                // Create user and colors first
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "User 1" }),
                    returning: ["id"],
                });

                await db.createOne("user", {
                    values: factory.user({ id: 2, name: "User 2" }),
                    returning: ["id"],
                });

                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#FF0000", name: "Red" }),
                        factory.color({ hex: "#00FF00", name: "Green" }),
                    ],
                });

                // Create posts with N:1 relations to colors
                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            title: "Post 1",
                            backgroundColorValue: "#FF0000",
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            title: "Post 2",
                            backgroundColorValue: "#00FF00",
                        }),
                    ],
                });

                // Create likes (N:N relation via post -> likes <- user)
                await db.createMany("like", {
                    values: [
                        factory.like({ id: 1, userId: 2, postId: 1 }),
                        factory.like({ id: 2, userId: 2, postId: 2 }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                    include: {
                        posts: {
                            select: ["id", "title"],
                            include: {
                                backgroundColor: {
                                    select: ["hex", "name"],
                                },
                                likes: {
                                    select: ["id"],
                                    include: {
                                        user: {
                                            select: ["id", "name"],
                                        },
                                    },
                                },
                            },
                            orderBy: ["id"],
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    name: "User 1",
                    posts: [
                        {
                            id: 1,
                            title: "Post 1",
                            backgroundColor: {
                                hex: "#FF0000",
                                name: "Red",
                            },
                            likes: [
                                {
                                    id: 1,
                                    user: { id: 2, name: "User 2" },
                                },
                            ],
                        },
                        {
                            id: 2,
                            title: "Post 2",
                            backgroundColor: {
                                hex: "#00FF00",
                                name: "Green",
                            },
                            likes: [
                                {
                                    id: 2,
                                    user: { id: 2, name: "User 2" },
                                },
                            ],
                        },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("can filter and order deeply nested relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                    returning: ["id"],
                });

                await db.createOne("user", {
                    values: factory.user({ id: 2 }),
                    returning: ["id"],
                });

                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#FF0000", name: "Red" }),
                        factory.color({ hex: "#00FF00", name: "Green" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            backgroundColorValue: "#FF0000",
                            createdAt: new Date("2024-01-01"),
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            backgroundColorValue: "#00FF00",
                            createdAt: new Date("2024-01-02"),
                        }),
                    ],
                });

                await db.createMany("like", {
                    values: [
                        factory.like({
                            id: 1,
                            userId: 2,
                            postId: 1,
                            createdAt: new Date("2024-01-03"),
                        }),
                        factory.like({
                            id: 2,
                            userId: 1,
                            postId: 1,
                            createdAt: new Date("2024-01-04"),
                        }),
                        factory.like({
                            id: 3,
                            userId: 2,
                            postId: 2,
                            createdAt: new Date("2024-01-04"),
                        }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        posts: {
                            select: ["id"],
                            where: {},
                            include: {
                                backgroundColor: {
                                    select: ["name"],
                                    where: {
                                        name: "Red",
                                    },
                                },
                                likes: {
                                    select: ["id", "createdAt"],
                                    orderBy: [["createdAt", "desc"]],
                                    include: {
                                        user: {
                                            select: ["id"],
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    posts: [
                        {
                            id: 1,
                            backgroundColor: { name: "Red" },
                            likes: [
                                {
                                    id: 2,
                                    createdAt: new Date("2024-01-04"),
                                    user: { id: 1 },
                                },
                                {
                                    id: 1,
                                    createdAt: new Date("2024-01-03"),
                                    user: { id: 2 },
                                },
                            ],
                        },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("can include oneToMany relations with multi-field joins", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Lynne Tillman" }),
                        factory.user({ id: 2, name: "Stewart Home" }),
                        factory.user({ id: 3, name: "Judith Butler" }),
                    ],
                });

                await db.createMany("friendship", {
                    values: [
                        factory.friendship({ userId: 1, friendId: 2 }),
                        factory.friendship({ userId: 1, friendId: 3 }),
                    ],
                });

                await db.createMany("friendshipStats", {
                    values: [
                        factory.friendshipStats({
                            id: 1,
                            userId: 1,
                            friendId: 2,
                            messagesSent: 100,
                            likesGiven: 50,
                        }),
                        factory.friendshipStats({
                            id: 2,
                            userId: 1,
                            friendId: 3,
                            messagesSent: 200,
                            likesGiven: 75,
                        }),
                    ],
                });

                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        friendships: {
                            select: ["userId", "friendId"],
                            include: {
                                friend: {
                                    select: ["id", "name"],
                                },
                                stats: {
                                    select: ["messagesSent", "likesGiven"],
                                },
                            },
                        },
                    },
                });

                expect(user).toEqual({
                    id: 1,
                    friendships: [
                        {
                            userId: 1,
                            friendId: 2,
                            friend: { id: 2, name: "Stewart Home" },
                            stats: { messagesSent: 100, likesGiven: 50 },
                        },
                        {
                            userId: 1,
                            friendId: 3,
                            friend: { id: 3, name: "Judith Butler" },
                            stats: { messagesSent: 200, likesGiven: 75 },
                        },
                    ],
                });
            },
            { rollback: true },
        );
    });
});
