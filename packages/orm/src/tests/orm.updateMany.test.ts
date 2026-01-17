import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { $in } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("updateMany", () => {
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

    test("updates multiple records with specified values", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "user" }),
                        factory.user({ id: 2, role: "user" }),
                        factory.user({ id: 3, role: "admin" }),
                    ],
                });

                const updated = await db.updateMany("user", {
                    set: { role: "admin" },
                    where: { role: "user" },
                });

                expect(updated).toBe(2);

                const users = await db.findMany("user", {
                    select: ["id", "role"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, role: "admin" },
                    { id: 2, role: "admin" },
                    { id: 3, role: "admin" },
                ]);
            },
            { rollback: true },
        );
    });

    test("returns 0 when no records match update criteria", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "admin" }),
                        factory.user({ id: 2, role: "admin" }),
                    ],
                });

                const updated = await db.updateMany("user", {
                    set: { role: "user" },
                    where: { id: 3 },
                });

                expect(updated).toBe(0);
            },
            { rollback: true },
        );
    });

    test("updates json fields correctly", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            preferences: { theme: "light" },
                        }),
                        factory.user({
                            id: 2,
                            preferences: { theme: "light" },
                        }),
                    ],
                });

                await db.updateMany("user", {
                    set: { preferences: { theme: "dark" } },
                    where: { id: { [$in]: [1, 2] } },
                });

                const users = await db.findMany("user", {
                    select: ["id", "preferences"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, preferences: { theme: "dark" } },
                    { id: 2, preferences: { theme: "dark" } },
                ]);
            },
            { rollback: true },
        );
    });

    test("updates array fields correctly", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({
                        id: 1,
                    }),
                });
                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            tags: ["old"],
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            tags: ["old"],
                            authorId: 1,
                        }),
                    ],
                });

                await db.updateMany("post", {
                    set: { tags: ["new"] },
                    where: { id: { [$in]: [1] } },
                });

                const posts = await db.findMany("post", {
                    select: ["id", "tags"],
                    orderBy: ["id"],
                });

                expect(posts).toEqual([
                    { id: 1, tags: ["new"] },
                    { id: 2, tags: ["old"] },
                ]);
            },
            { rollback: true },
        );
    });

    test("handles null values in updates", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            deletedAt: new Date("2024-01-21"),
                        }),
                        factory.user({
                            id: 2,
                            deletedAt: new Date("2024-01-21"),
                        }),
                    ],
                });

                await db.updateMany("user", {
                    set: { deletedAt: null },
                    where: { id: { [$in]: [2] } },
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

    test("throws error when updating non-existent model", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    // @ts-expect-error - Testing runtime behavior
                    db.updateMany("invalid", {
                        set: { field: "value" },
                        where: { id: 1 },
                    }),
                ).rejects.toThrow('Model "invalid" not found');
            },
            { rollback: true },
        );
    });

    test("throws error when updating with non-existent field", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.updateMany("user", {
                        // @ts-expect-error - Testing runtime behavior
                        set: { nonexistent: "value" },
                        where: { id: 1 },
                    }),
                ).rejects.toThrow(
                    'Field "nonexistent" not found in model "user"',
                );
            },
            { rollback: true },
        );
    });

    test("handles special characters in update values", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Original" }),
                        factory.user({ id: 2, name: "Original" }),
                    ],
                });

                await db.updateMany("user", {
                    set: { name: "O'Connor; DROP TABLE users;" },
                    where: { id: { [$in]: [1, 2] } },
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, name: "O'Connor; DROP TABLE users;" },
                    { id: 2, name: "O'Connor; DROP TABLE users;" },
                ]);
            },
            { rollback: true },
        );
    });

    test("handles large text values in updates", async () => {
        await db.transact(
            async (db) => {
                const longText = "a".repeat(10000);
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Original" }),
                        factory.user({ id: 2, name: "Original" }),
                    ],
                });

                await db.updateMany("user", {
                    set: { name: longText },
                    where: { id: { [$in]: [1, 2] } },
                });

                const users = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, name: longText },
                    { id: 2, name: longText },
                ]);
            },
            { rollback: true },
        );
    });
});
