import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("findMany: offset and limit", () => {
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

    test("uses offset to skip records", async () => {
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
                    offset: 1,
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 2, name: "Bob" },
                    { id: 3, name: "Charlie" },
                ]);
            },
            { rollback: true },
        );
    });

    test("uses limit to restrict number of records", async () => {
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
                    limit: 2,
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, name: "Alice" },
                    { id: 2, name: "Bob" },
                ]);
            },
            { rollback: true },
        );
    });

    test("combines offset and limit", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Bob" }),
                        factory.user({ id: 3, name: "Charlie" }),
                        factory.user({ id: 4, name: "Dave" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    offset: 1,
                    limit: 2,
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 2, name: "Bob" },
                    { id: 3, name: "Charlie" },
                ]);
            },
            { rollback: true },
        );
    });

    test("handles offset beyond available records", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Alice" }),
                        factory.user({ id: 2, name: "Bob" }),
                    ],
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    offset: 5,
                    orderBy: ["id"],
                });

                expect(users).toEqual([]);
            },
            { rollback: true },
        );
    });

    test("throws error for negative offset", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.findMany("user", {
                        select: ["id", "name"],
                        offset: -1,
                    }),
                ).rejects.toThrow("OFFSET must not be negative");
            },
            { rollback: true },
        );
    });

    test("throws error for negative limit", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.findMany("user", {
                        select: ["id", "name"],
                        limit: -1,
                    }),
                ).rejects.toThrow("LIMIT must not be negative");
            },
            { rollback: true },
        );
    });
});
