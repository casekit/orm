import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import {
    $and,
    $eq,
    $gt,
    $gte,
    $ilike,
    $in,
    $is,
    $like,
    $lt,
    $lte,
    $ne,
    $not,
    $or,
} from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("findMany: where", () => {
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

    describe("basic operators", () => {
        test("a value with no operator performs an equality check", async () => {
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
                        where: { name: "Alice" },
                    });

                    expect(users).toEqual([{ id: 1, name: "Alice" }]);
                },
                { rollback: true },
            );
        });
        test("$eq operator matches exact values", async () => {
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
                        where: { name: { [$eq]: "Alice" } },
                    });

                    expect(users).toEqual([{ id: 1, name: "Alice" }]);
                },
                { rollback: true },
            );
        });

        test("$ne operator excludes matching values", async () => {
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
                        where: { name: { [$ne]: "Alice" } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([{ id: 2, name: "Bob" }]);
                },
                { rollback: true },
            );
        });

        test("$gt operator compares values correctly", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                            factory.user({ id: 3 }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { id: { [$gt]: 1 } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([{ id: 2 }, { id: 3 }]);
                },
                { rollback: true },
            );
        });

        test("$gte operator compares values correctly", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                            factory.user({ id: 3 }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { id: { [$gte]: 2 } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([{ id: 2 }, { id: 3 }]);
                },
                { rollback: true },
            );
        });

        test("$lt operator compares values correctly", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                            factory.user({ id: 3 }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { id: { [$lt]: 3 } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([{ id: 1 }, { id: 2 }]);
                },
                { rollback: true },
            );
        });

        test("$lte operator compares values correctly", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                            factory.user({ id: 3 }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { id: { [$lte]: 2 } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([{ id: 1 }, { id: 2 }]);
                },
                { rollback: true },
            );
        });
    });

    describe("array operators", () => {
        test("$in operator matches array of values", async () => {
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
                        where: { name: { [$in]: ["Alice", "Charlie"] } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([
                        { id: 1, name: "Alice" },
                        { id: 3, name: "Charlie" },
                    ]);
                },
                { rollback: true },
            );
        });

        test("$in operator with empty array returns no results", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { id: { [$in]: [] } },
                    });

                    expect(users).toEqual([]);
                },
                { rollback: true },
            );
        });
    });

    describe("string matching operators", () => {
        test("$like operator matches pattern", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, name: "Alice" }),
                            factory.user({ id: 2, name: "alex" }),
                            factory.user({ id: 3, name: "Bob" }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id", "name"],
                        where: { name: { [$like]: "A%" } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([{ id: 1, name: "Alice" }]);
                },
                { rollback: true },
            );
        });

        test("$ilike operator matches pattern case-insensitive", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, name: "Alice" }),
                            factory.user({ id: 2, name: "alex" }),
                            factory.user({ id: 3, name: "Bob" }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id", "name"],
                        where: { name: { [$ilike]: "a%" } },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([
                        { id: 1, name: "Alice" },
                        { id: 2, name: "alex" },
                    ]);
                },
                { rollback: true },
            );
        });
    });

    describe("null handling operators", () => {
        test("null as a value performs an IS NULL check", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, deletedAt: new Date() }),
                            factory.user({ id: 2, deletedAt: null }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { deletedAt: null },
                    });

                    expect(users).toEqual([{ id: 2 }]);
                },
                { rollback: true },
            );
        });

        test("$is operator handles null values", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, deletedAt: new Date() }),
                            factory.user({ id: 2, deletedAt: null }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { deletedAt: { [$is]: null } },
                    });

                    expect(users).toEqual([{ id: 2 }]);
                },
                { rollback: true },
            );
        });

        test("$not operator with null finds non-null values", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, deletedAt: new Date() }),
                            factory.user({ id: 2, deletedAt: null }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id"],
                        where: { deletedAt: { [$not]: null } },
                    });

                    expect(users).toEqual([{ id: 1 }]);
                },
                { rollback: true },
            );
        });
    });

    describe("logical operators", () => {
        test("$and operator combines conditions", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({
                                id: 1,
                                name: "Alice",
                                role: "admin",
                            }),
                            factory.user({ id: 2, name: "Bob", role: "user" }),
                            factory.user({
                                id: 3,
                                name: "Charlie",
                                role: "admin",
                            }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id", "name"],
                        where: {
                            [$and]: [
                                { role: "admin" },
                                { name: { [$like]: "A%" } },
                            ],
                        },
                    });

                    expect(users).toEqual([{ id: 1, name: "Alice" }]);
                },
                { rollback: true },
            );
        });

        test("$or operator combines conditions", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({
                                id: 1,
                                name: "Alice",
                                role: "admin",
                            }),
                            factory.user({ id: 2, name: "Bob", role: "user" }),
                            factory.user({
                                id: 3,
                                name: "Charlie",
                                role: "admin",
                            }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id", "name"],
                        where: {
                            [$or]: [{ name: "Alice" }, { name: "Bob" }],
                        },
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

        test("can combine $and and $or operators", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({
                                id: 1,
                                name: "Alice",
                                role: "admin",
                            }),
                            factory.user({ id: 2, name: "Bob", role: "user" }),
                            factory.user({
                                id: 3,
                                name: "Charlie",
                                role: "admin",
                            }),
                            factory.user({
                                id: 4,
                                name: "Charlie",
                                role: "user",
                            }),
                            factory.user({
                                id: 5,
                                name: "David",
                                role: "admin",
                            }),
                        ],
                    });

                    const users = await db.findMany("user", {
                        select: ["id", "name"],
                        where: {
                            [$and]: [
                                { role: "admin" },
                                {
                                    [$or]: [
                                        { name: "Alice" },
                                        { name: "Charlie" },
                                    ],
                                },
                            ],
                        },
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([
                        { id: 1, name: "Alice" },
                        { id: 3, name: "Charlie" },
                    ]);
                },
                { rollback: true },
            );
        });
    });

    describe("error cases", () => {
        test("$in operator throws error with non-array value", async () => {
            await db.transact(
                async (db) => {
                    await expect(
                        db.findMany("user", {
                            select: ["id"],
                            // @ts-expect-error testing invalid value
                            where: { id: { [$in]: "not-an-array" } },
                        }),
                    ).rejects.toThrow("Non-array passed to IN clause");
                },
                { rollback: true },
            );
        });

        test("$not operator throws error with invalid value", async () => {
            await db.transact(
                async (db) => {
                    await expect(
                        db.findMany("user", {
                            select: ["id"],
                            // @ts-expect-error testing invalid value
                            where: { id: { [$not]: "invalid" } },
                        }),
                    ).rejects.toThrow("Invalid value passed to $not operator");
                },
                { rollback: true },
            );
        });
    });
});
