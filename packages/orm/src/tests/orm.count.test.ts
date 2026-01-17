import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { $ilike } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("count", () => {
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

    test("returns zero when no records match", async () => {
        await db.transact(
            async (db) => {
                const count = await db.count("post", {
                    where: { id: 999 },
                });

                expect(count).toBe(0);
            },
            { rollback: true },
        );
    });

    test("counts all records when no filter is applied", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Bob" }),
                        factory.user({ id: 3, name: "Charlie" }),
                    ],
                });

                const count = await db.count("user", {});

                expect(count).toBe(3);
            },
            { rollback: true },
        );
    });

    test("counts filtered records when where clause is applied", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Bob" }),
                        factory.user({ id: 3, name: "Alice" }), // Same name
                    ],
                });

                const count = await db.count("user", {
                    where: { name: "Alice" },
                });

                expect(count).toBe(2);
            },
            { rollback: true },
        );
    });

    test("counts respects N:1 relation filters", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Author1" }),
                        factory.user({ id: 2, name: "Author2" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({ id: 1, title: "Post 1", authorId: 1 }),
                        factory.post({ id: 2, title: "Post 2", authorId: 1 }),
                        factory.post({ id: 3, title: "Post 3", authorId: 2 }),
                    ],
                });

                const count = await db.count("post", {
                    include: {
                        author: {
                            where: { name: "Author1" },
                        },
                    },
                });

                expect(count).toBe(2);
            },
            { rollback: true },
        );
    });

    test("handles deeply nested relation filters", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#ff0000", name: "Red" }),
                        factory.color({ hex: "#00ff00", name: "Green" }),
                    ],
                });

                await db.createMany("user", {
                    values: [factory.user({ id: 1, name: "Author1" })],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            title: "Tech Post 1",
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                        }),
                        factory.post({
                            id: 2,
                            title: "Videogames Post 1",
                            authorId: 1,
                            backgroundColorValue: "#00ff00",
                        }),
                        factory.post({
                            id: 3,
                            title: "Science Post 1",
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                        }),

                        factory.post({
                            id: 4,
                            title: "Science Post 2",
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                        }),
                    ],
                });

                const count = await db.count("post", {
                    where: {
                        title: { [$ilike]: "%1" },
                    },
                    include: {
                        author: {
                            where: {
                                name: "Author1",
                            },
                        },
                        backgroundColor: {
                            where: {
                                name: "Red",
                            },
                        },
                    },
                });

                expect(count).toBe(2);
            },
            { rollback: true },
        );
    });

    test("handles for update clause", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Bob" }),
                    ],
                });

                // Not a great test, just makes sure the query actually runs
                // with this clause
                const count = await db.count("user", {
                    for: "update",
                });

                expect(count).toBe(2);
            },
            { rollback: true },
        );
    });
});
