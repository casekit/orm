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

describe("findOne: where", () => {
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

                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: { name: "Alice" },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
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

                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: { name: { [$eq]: "Alice" } },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
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
                            factory.user({ id: 3, name: "Charlie" }),
                        ],
                    });

                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: {
                            [$and]: [
                                { name: { [$ne]: "Alice" } },
                                { name: { [$ne]: "Charlie" } },
                            ],
                        },
                    });

                    expect(user).toEqual({ id: 2, name: "Bob" });
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

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: {
                            id: { [$gt]: 1, [$lt]: 3 },
                        },
                    });

                    expect(user).toEqual({ id: 2 });
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

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: {
                            id: { [$gte]: 2, [$lt]: 3 },
                        },
                    });

                    expect(user).toEqual({ id: 2 });
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

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: {
                            id: { [$lt]: 2 },
                        },
                    });

                    expect(user).toEqual({ id: 1 });
                },
                { rollback: true },
            );
        });

        test("$lte operator compares values correctly", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, role: "user" }),
                            factory.user({ id: 2, role: "admin" }),
                            factory.user({ id: 3 }),
                        ],
                    });

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: {
                            id: { [$lte]: 2 },
                            role: "admin",
                        },
                    });

                    expect(user).toEqual({ id: 2 });
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

                    // Only Alice is in the name array and has the admin role
                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: {
                            name: { [$in]: ["Alice", "David"] },
                            role: "admin",
                        },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
                },
                { rollback: true },
            );
        });

        test("$in operator with matching single value returns a result", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                        ],
                    });

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: { id: { [$in]: [1] } },
                    });

                    expect(user).toEqual({ id: 1 });
                },
                { rollback: true },
            );
        });

        test("$in operator with empty array throws 'expected one row but found none'", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1 }),
                            factory.user({ id: 2 }),
                        ],
                    });

                    await expect(
                        db.findOne("user", {
                            select: ["id"],
                            where: { id: { [$in]: [] } },
                        }),
                    ).rejects.toThrow("Expected one row, but found none");
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

                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: { name: { [$like]: "A%" } },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
                },
                { rollback: true },
            );
        });

        test("$ilike operator with specific pattern ensures single result", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, name: "Alice" }),
                            factory.user({ id: 2, name: "alex" }),
                            factory.user({ id: 3, name: "Bob" }),
                        ],
                    });

                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: { name: { [$ilike]: "al_ce" } },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
                },
                { rollback: true },
            );
        });

        test("$ilike operator with ambiguous pattern throws 'expected one row but found more'", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, name: "Alice" }),
                            factory.user({ id: 2, name: "alex" }),
                            factory.user({ id: 3, name: "Bob" }),
                        ],
                    });

                    await expect(
                        db.findOne("user", {
                            select: ["id", "name"],
                            where: { name: { [$ilike]: "a%" } },
                        }),
                    ).rejects.toThrow("Expected one row, but found more");
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

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: { deletedAt: null },
                    });

                    expect(user).toEqual({ id: 2 });
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

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: { deletedAt: { [$is]: null } },
                    });

                    expect(user).toEqual({ id: 2 });
                },
                { rollback: true },
            );
        });

        test("$not operator with null finds non-null value", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, deletedAt: new Date() }),
                            factory.user({ id: 2, deletedAt: null }),
                        ],
                    });

                    const user = await db.findOne("user", {
                        select: ["id"],
                        where: { deletedAt: { [$not]: null } },
                    });

                    expect(user).toEqual({ id: 1 });
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

                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: {
                            [$and]: [
                                { role: "admin" },
                                { name: { [$like]: "A%" } },
                            ],
                        },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
                },
                { rollback: true },
            );
        });

        test("$or operator with specific condition ensures single result", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({
                                id: 1,
                                name: "Alice",
                                email: "alice@example.com",
                                role: "admin",
                            }),
                            factory.user({
                                id: 2,
                                name: "Bob",
                                email: "bob@example.com",
                                role: "user",
                            }),
                            factory.user({
                                id: 3,
                                name: "Charlie",
                                email: "charlie@example.com",
                                role: "user",
                            }),
                        ],
                    });

                    // Only Alice matches this unique combination of criteria
                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: {
                            [$or]: [
                                // This combination only matches Alice
                                { name: "Alice", role: "admin" },
                                // This combination doesn't match any user
                                {
                                    name: "David",
                                    email: "nonexistent@example.com",
                                },
                            ],
                        },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
                },
                { rollback: true },
            );
        });

        test("can combine $and and $or operators to find unique record", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({
                                id: 1,
                                name: "Alice",
                                role: "admin",
                                email: "alice@example.com",
                            }),
                            factory.user({
                                id: 2,
                                name: "Bob",
                                role: "user",
                                email: "bob@example.com",
                            }),
                            factory.user({
                                id: 3,
                                name: "Charlie",
                                role: "admin",
                                email: "charlie@example.com",
                            }),
                            factory.user({
                                id: 4,
                                name: "Charlie",
                                role: "user",
                                email: "charlie2@example.com",
                            }),
                            factory.user({
                                id: 5,
                                name: "David",
                                role: "admin",
                                email: "david@example.com",
                            }),
                        ],
                    });

                    // This combination of conditions should only match Alice
                    const user = await db.findOne("user", {
                        select: ["id", "name"],
                        where: {
                            [$and]: [
                                { role: "admin" },
                                {
                                    [$or]: [
                                        { name: "Alice" },
                                        {
                                            name: "David",
                                            email: "not-david@example.com",
                                        }, // Won't match
                                    ],
                                },
                            ],
                        },
                    });

                    expect(user).toEqual({ id: 1, name: "Alice" });
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
                        db.findOne("user", {
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
                        db.findOne("user", {
                            select: ["id"],
                            // @ts-expect-error testing invalid value
                            where: { id: { [$not]: "invalid" } },
                        }),
                    ).rejects.toThrow("Invalid value passed to $not operator");
                },
                { rollback: true },
            );
        });

        test("throws error when no records match criteria", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [factory.user({ id: 1, name: "Alice" })],
                    });

                    await expect(
                        db.findOne("user", {
                            select: ["id"],
                            where: { id: 999 },
                        }),
                    ).rejects.toThrow("Expected one row, but found none");
                },
                { rollback: true },
            );
        });

        test("throws error when multiple records match criteria", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            factory.user({ id: 1, name: "Alice" }),
                            factory.user({ id: 2, name: "Alice" }),
                        ],
                    });

                    await expect(
                        db.findOne("user", {
                            select: ["id"],
                            where: { name: "Alice" },
                        }),
                    ).rejects.toThrow("Expected one row, but found more");
                },
                { rollback: true },
            );
        });
    });
});
