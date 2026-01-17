import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { $like } from "../operators.js";
import { Orm, orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("findOne", () => {
    const logger = mockLogger();
    let db: Orm<typeof config>;

    beforeEach(() => {
        logger.clear();
    });

    beforeAll(async () => {
        db = orm({ ...config, logger });
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test("finds a single record with basic select", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        role: "user",
                    },
                    returning: ["id"],
                });

                const foundUser = await db.findOne("user", {
                    select: ["id", "name", "email"],
                    where: { id: user.id },
                });

                expect(foundUser).toEqual({
                    id: 1,
                    name: "Test User",
                    email: "test@example.com",
                });
            },
            { rollback: true },
        );
    });

    test("finds a record with N:1 relation", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        role: "user",
                    },
                    returning: ["id"],
                });

                await db.createOne("post", {
                    values: {
                        title: "Test Post",
                        content: "Test Content",
                        authorId: user.id,
                    },
                    returning: ["id"],
                });

                const post = await db.findOne("post", {
                    select: ["id", "title"],
                    include: {
                        author: {
                            select: ["id", "name"],
                        },
                    },
                    where: { authorId: user.id },
                });

                expect(post).toEqual({
                    id: expect.any(Number),
                    title: "Test Post",
                    author: {
                        id: 1,
                        name: "Test User",
                    },
                });
            },
            { rollback: true },
        );
    });

    test("finds a record with optional N:1 relation", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Stewart Home",
                        email: "stewart@example.com",
                        role: "user",
                    },
                    returning: ["id"],
                });

                const color = await db.createOne("color", {
                    values: {
                        name: "Red",
                        hex: "#FF0000",
                    },
                    returning: ["hex"],
                });

                const posts = await db.createMany("post", {
                    values: [
                        {
                            title: "Test Post",
                            content: "Test Content",
                            authorId: user.id,
                        },
                        {
                            title: "Test Post 2",
                            content: "Test Content 2",
                            authorId: user.id,
                            backgroundColorValue: color.hex,
                        },
                    ],
                    returning: ["id"],
                });

                const postWithoutBgColor = await db.findOne("post", {
                    select: ["id", "title"],
                    include: {
                        backgroundColor: {
                            select: ["hex", "name"],
                        },
                    },
                    where: { id: posts[0]!.id },
                });

                expect(postWithoutBgColor).toEqual({
                    id: expect.any(Number),
                    title: "Test Post",
                    backgroundColor: null,
                });

                const postWithBgColor = await db.findOne("post", {
                    select: ["id", "title"],
                    include: {
                        backgroundColor: {
                            select: ["hex", "name"],
                        },
                    },
                    where: { id: posts[1]!.id },
                });

                expect(postWithBgColor).toEqual({
                    id: expect.any(Number),
                    title: "Test Post 2",
                    backgroundColor: { hex: "#FF0000", name: "Red" },
                });
            },
            { rollback: true },
        );
    });

    test("throws error when no records match criteria", async () => {
        await db.transact(
            async (db) => {
                await expect(
                    db.findOne("user", {
                        select: ["id"],
                        where: { id: 999999 },
                    }),
                ).rejects.toThrow("Expected one row, but found none");
            },
            { rollback: true },
        );
    });

    test("throws error when multiple records match criteria", async () => {
        await db.transact(
            async (db) => {
                // Create multiple users with similar names
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "John Doe",
                            email: "john1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "John Doe",
                            email: "john2@example.com",
                            role: "user",
                        },
                    ],
                });

                await expect(
                    db.findOne("user", {
                        select: ["id", "name"],
                        where: {
                            name: { [$like]: "John%" },
                        },
                    }),
                ).rejects.toThrow("Expected one row, but found more");
            },
            { rollback: true },
        );
    });

    test("handles complex where clauses with array and JSON fields", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        role: "user",
                    },
                    returning: ["id"],
                });

                await db.createOne("post", {
                    values: {
                        title: "Test Post",
                        content: "Test Content",
                        authorId: user.id,
                        tags: ["test", "example"],
                        metadata: {
                            foo: "a",
                            bar: [{ baz: "good", quux: true }],
                        },
                    },
                });

                const post = await db.findOne("post", {
                    select: ["id", "title", "tags", "metadata"],
                    where: {
                        tags: ["test", "example"],
                        metadata: {
                            foo: "a",
                            bar: [{ baz: "good", quux: true }],
                        },
                    },
                });

                expect(post).toEqual({
                    id: expect.any(Number),
                    title: "Test Post",
                    tags: ["test", "example"],
                    metadata: {
                        foo: "a",
                        bar: [{ baz: "good", quux: true }],
                    },
                });
            },
            { rollback: true },
        );
    });

    test("respects enum field types", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test Admin",
                        email: "admin@example.com",
                        role: "admin",
                    },
                });

                const admin = await db.findOne("user", {
                    select: ["id", "name", "role"],
                    where: { role: "admin" },
                });

                expect(admin.role).toBe("admin");

                // TypeScript should prevent this, but we test at runtime too
                await expect(
                    db.findOne("user", {
                        select: ["id"],
                        where: {
                            // @ts-expect-error - invalid role
                            role: "superadmin",
                        },
                    }),
                ).rejects.toThrow();
            },
            { rollback: true },
        );
    });
});
