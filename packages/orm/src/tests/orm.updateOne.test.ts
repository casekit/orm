import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { createTestDB } from "./util/db.js";

describe("updateOne", () => {
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

    test("updates a single record with specified values", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "user" }),
                        factory.user({ id: 2, role: "user" }),
                    ],
                });

                const updated = await db.updateOne("user", {
                    set: { role: "admin" },
                    where: { id: 1 },
                });

                expect(updated).toBe(1);

                const users = await db.findMany("user", {
                    select: ["id", "role"],
                    orderBy: ["id"],
                });

                expect(users).toEqual([
                    { id: 1, role: "admin" },
                    { id: 2, role: "user" },
                ]);
            },
            { rollback: true },
        );
    });

    test("throws error when no records match update criteria", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "admin" }),
                        factory.user({ id: 2, role: "admin" }),
                    ],
                });

                await expect(
                    db.updateOne("user", {
                        set: { role: "user" },
                        where: { id: 3 },
                    }),
                ).rejects.toThrow("Update one failed to update a row");
            },
            { rollback: true },
        );
    });

    test("throws error when multiple records would be updated", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "user" }),
                        factory.user({ id: 2, role: "user" }),
                    ],
                });

                await expect(
                    db.updateOne("user", {
                        set: { role: "admin" },
                        where: { role: "user" },
                    }),
                ).rejects.toThrow(
                    "Update one would have updated more than one row",
                );
            },
            { rollback: true },
        );
    });

    test("updates json fields correctly", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({
                        id: 1,
                        preferences: { theme: "light" },
                    }),
                });

                await db.updateOne("user", {
                    set: { preferences: { theme: "dark" } },
                    where: { id: 1 },
                });

                const user = await db.findOne("user", {
                    select: ["id", "preferences"],
                    where: { id: 1 },
                });

                expect(user).toEqual({
                    id: 1,
                    preferences: { theme: "dark" },
                });
            },
            { rollback: true },
        );
    });

    test("updates array fields correctly", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                });
                await db.createOne("post", {
                    values: factory.post({
                        id: 1,
                        tags: ["old"],
                        authorId: 1,
                    }),
                });

                await db.updateOne("post", {
                    set: { tags: ["new"] },
                    where: { id: 1 },
                });

                const post = await db.findOne("post", {
                    select: ["id", "tags"],
                    where: { id: 1 },
                });

                expect(post).toEqual({
                    id: 1,
                    tags: ["new"],
                });
            },
            { rollback: true },
        );
    });

    test("handles null values in updates", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({
                        id: 1,
                        deletedAt: new Date("2024-01-21"),
                    }),
                });

                await db.updateOne("user", {
                    set: { deletedAt: null },
                    where: { id: 1 },
                });

                const user = await db.findOne("user", {
                    select: ["id", "deletedAt"],
                    where: { id: 1 },
                });

                expect(user).toEqual({
                    id: 1,
                    deletedAt: null,
                });
            },
            { rollback: true },
        );
    });

    test("throws error when updating non-existent model", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    // @ts-expect-error - Testing runtime behavior
                    db.updateOne("invalid", {
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
                    db.updateOne("user", {
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
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Original" }),
                });

                await db.updateOne("user", {
                    set: { name: "O'Connor; DROP TABLE users;" },
                    where: { id: 1 },
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                });

                expect(user).toEqual({
                    id: 1,
                    name: "O'Connor; DROP TABLE users;",
                });
            },
            { rollback: true },
        );
    });

    test("handles large text values in updates", async () => {
        await db.transact(
            async (db) => {
                const longText = "a".repeat(10000);
                await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Original" }),
                });

                await db.updateOne("user", {
                    set: { name: longText },
                    where: { id: 1 },
                });

                const user = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: 1 },
                });

                expect(user).toEqual({
                    id: 1,
                    name: longText,
                });
            },
            { rollback: true },
        );
    });

    test("returns updated record when returning clause is specified", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: factory.user({ id: 1, role: "user" }),
                });

                const result = await db.updateOne("user", {
                    set: { role: "admin" },
                    where: { id: 1 },
                    returning: ["id", "role"],
                });

                expect(result).toEqual({
                    id: 1,
                    role: "admin",
                });
            },
            { rollback: true },
        );
    });
});
