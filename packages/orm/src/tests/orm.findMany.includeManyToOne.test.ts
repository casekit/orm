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

describe("findMany: N:1 relations", () => {
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

    test("can select N:1 relations", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Author 1" }),
                        factory.user({ id: 2, name: "Author 2" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 3,
                            title: "Post 1",
                            authorId: 1,
                        }),
                        factory.post({
                            id: 4,
                            title: "Post 2",
                            authorId: 2,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "title"],
                    include: {
                        author: {
                            select: ["id", "name"],
                        },
                    },
                    orderBy: ["id"],
                });

                expect(posts).toEqual([
                    {
                        id: 3,
                        title: "Post 1",
                        author: { id: 1, name: "Author 1" },
                    },
                    {
                        id: 4,
                        title: "Post 2",
                        author: { id: 2, name: "Author 2" },
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("can select nested N:1 relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("color", {
                    values: factory.color({ hex: "#ff0000", name: "Red" }),
                });

                const user = await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Author" }),
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 2,
                            title: "Post 2",
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id"],
                    include: {
                        author: {
                            select: ["name"],
                            include: {
                                posts: {
                                    select: ["id", "title"],
                                    include: {
                                        backgroundColor: {
                                            select: ["name"],
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                expect(posts).toEqual([
                    {
                        id: 2,
                        author: {
                            name: "Author",
                            posts: [
                                {
                                    id: 2,
                                    title: "Post 2",
                                    backgroundColor: { name: "Red" },
                                },
                            ],
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("can order by N:1 relation fields", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Zeus" }),
                        factory.user({ id: 2, name: "Apollo" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 3,
                            title: "Post 1",
                            authorId: 1,
                        }),
                        factory.post({
                            id: 4,
                            title: "Post 2",
                            authorId: 2,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id", "title"],
                    include: {
                        author: { select: ["name"] },
                    },
                    orderBy: ["author.name"],
                });

                expect(posts).toEqual([
                    { id: 4, title: "Post 2", author: { name: "Apollo" } },
                    { id: 3, title: "Post 1", author: { name: "Zeus" } },
                ]);
            },
            { rollback: true },
        );
    });

    test("filters by N:1 relation where clause", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            name: "Active",
                            deletedAt: null,
                        }),
                        factory.user({
                            id: 2,
                            name: "Deleted",
                            deletedAt: new Date(),
                        }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            authorId: 2,
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id"],
                    include: {
                        author: {
                            select: ["name"],
                            where: { deletedAt: null },
                        },
                    },
                });

                expect(posts).toEqual([{ id: 1, author: { name: "Active" } }]);
            },
            { rollback: true },
        );
    });

    test("handles optional N:1 relation where clause", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#ff0000", name: "Red" }),
                        factory.color({ hex: "#0000ff", name: "Blue" }),
                    ],
                });

                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                        }),
                        factory.post({
                            id: 3,
                            authorId: 1,
                            backgroundColorValue: "#0000ff",
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id"],
                    include: {
                        backgroundColor: {
                            select: ["name"],
                            where: { name: "Blue" },
                        },
                    },
                    orderBy: ["id"],
                });

                expect(posts).toEqual([
                    {
                        id: 3,
                        backgroundColor: {
                            name: "Blue",
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("combines where clauses across multiple levels", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#ff0000", name: "Red" }),
                        factory.color({ hex: "#0000ff", name: "Blue" }),
                    ],
                });

                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "admin" }),
                        factory.user({ id: 2, role: "user" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                            publishedAt: new Date(),
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                            publishedAt: null,
                        }),
                        factory.post({
                            id: 3,
                            authorId: 2,
                            backgroundColorValue: "#ff0000",
                            publishedAt: new Date(),
                        }),
                        factory.post({
                            id: 4,
                            authorId: 1,
                            backgroundColorValue: "#0000ff",
                            publishedAt: new Date(),
                        }),
                    ],
                });

                const posts = await db.findMany("post", {
                    select: ["id"],
                    where: { publishedAt: { [$not]: null } },
                    include: {
                        author: {
                            select: ["id"],
                            where: { role: "admin" },
                        },
                        backgroundColor: {
                            select: ["name"],
                            where: { name: "Red" },
                        },
                    },
                });

                expect(posts).toEqual([
                    {
                        id: 1,
                        author: { id: 1 },
                        backgroundColor: { name: "Red" },
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
