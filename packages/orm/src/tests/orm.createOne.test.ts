import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { Orm, orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("createOne", () => {
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

    test("creates a record with full values and returns specified fields", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "user@example.com",
                        role: "user",
                    },
                    returning: ["id", "name", "role"],
                });

                expect(user).toEqual({
                    id: 1,
                    name: "Test User",
                    role: "user",
                });

                // Verify record was actually created
                const foundUser = await db.findOne("user", {
                    select: ["id", "name", "role"],
                    where: { id: 1 },
                });

                expect(foundUser).toEqual(user);
            },
            { rollback: true },
        );
    });

    test("creates record with minimal values using defaults", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "user@example.com",
                        role: "user",
                    },
                    returning: ["id", "name", "deletedAt"],
                });

                expect(user.deletedAt).toBeNull();
            },
            { rollback: true },
        );
    });

    test("returns row count when no returning clause specified", async () => {
        await db.transact(
            async (db) => {
                const result = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "user@example.com",
                        role: "user",
                    },
                });

                expect(result).toBe(1);

                // Verify record was created
                const user = await db.findOne("user", {
                    select: ["id"],
                    where: { id: 1 },
                });
                expect(user).toEqual({ id: 1 });
            },
            { rollback: true },
        );
    });

    test("throws error on constraint violation", async () => {
        await db.transact(
            async (db) => {
                const email = "test@example.com";

                // Create first user
                await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "First User",
                        email,
                        role: "user",
                    },
                });

                // Try to create another user with same email
                await expect(
                    db.createOne("user", {
                        values: {
                            id: 2,
                            name: "Second User",
                            email, // Duplicate email with same deletedAt (null)
                            role: "user",
                        },
                    }),
                ).rejects.toThrow(/duplicate key value/);
            },
            { rollback: true },
        );
    });

    test("handles onConflict do nothing with returning clause", async () => {
        await db.transact(
            async (db) => {
                const email = "test@example.com";

                const user1 = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Original User",
                        email,
                        role: "user",
                    },
                    returning: ["id", "name"],
                });

                // Try to create user with same email
                const user2 = await db.createOne("user", {
                    values: {
                        id: 1, // Same ID
                        name: "Duplicate User",
                        email,
                        role: "user",
                    },
                    onConflict: { do: "nothing" },
                    returning: ["id", "name"],
                });

                expect(user2).toBeNull();

                const originalUser = await db.findOne("user", {
                    select: ["id", "name"],
                    where: { id: user1.id },
                });
                expect(originalUser.name).toBe("Original User");
            },
            { rollback: true },
        );
    });

    test("handles onConflict do nothing without returning clause", async () => {
        await db.transact(
            async (db) => {
                const email = "test@example.com";

                await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Original User",
                        email,
                        role: "user",
                    },
                });

                // Try to create user with same email
                const result = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Duplicate User",
                        email,
                        role: "user",
                    },
                    onConflict: { do: "nothing" },
                });

                expect(result).toBe(0);
            },
            { rollback: true },
        );
    });

    test("handles enum fields in values", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        role: "admin",
                    },
                    returning: ["id", "name", "role"],
                });

                expect(user).toEqual({
                    id: 1,
                    name: "Test User",
                    role: "admin",
                });

                const foundUser = await db.findOne("user", {
                    select: ["id", "name", "role"],
                    where: { id: 1 },
                });
                expect(foundUser.role).toBe("admin");
            },
            { rollback: true },
        );
    });

    test("handles array and JSON fields in values", async () => {
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

                const post = await db.createOne("post", {
                    values: {
                        title: "Test Post",
                        content: "Test Content",
                        authorId: user.id,
                        tags: ["test", "example", "tags"],
                        metadata: {
                            foo: "a",
                            bar: [
                                { baz: "good", quux: true },
                                { baz: "bad", quux: false },
                            ],
                        },
                    },
                    returning: ["id", "title", "tags", "metadata"],
                });

                expect(post).toEqual({
                    id: expect.any(Number),
                    title: "Test Post",
                    tags: ["test", "example", "tags"],
                    metadata: {
                        foo: "a",
                        bar: [
                            { baz: "good", quux: true },
                            { baz: "bad", quux: false },
                        ],
                    },
                });

                const foundPost = await db.findOne("post", {
                    select: ["id", "title", "tags", "metadata"],
                    where: { id: post.id },
                });
                expect(foundPost.tags).toEqual(["test", "example", "tags"]);
                expect(foundPost.metadata).toEqual({
                    foo: "a",
                    bar: [
                        { baz: "good", quux: true },
                        { baz: "bad", quux: false },
                    ],
                });
            },
            { rollback: true },
        );
    });

    // TODO comment back in once relationships are implemented
    test.skip("can create post with relationship to user", async () => {
        await db.transact(
            async (db) => {
                // Create a user first
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        role: "user",
                    },
                    returning: ["id"],
                });

                // Create a post for the user
                const post = await db.createOne("post", {
                    values: {
                        title: "First Post",
                        content: "Hello World",
                        authorId: user.id,
                    },
                    returning: ["id", "title", "authorId"],
                });

                expect(post.authorId).toBe(user.id);
                expect(post).toHaveProperty("title");
                expect(post).toHaveProperty("id");

                // Verify the relationship works
                const userWithPost = await db.findOne("user", {
                    select: ["id"],
                    include: {
                        posts: {
                            select: ["id", "title"],
                        },
                    },
                    where: { id: user.id },
                });

                expect(userWithPost.posts).toHaveLength(1);
                expect(userWithPost.posts[0]?.title).toBe("First Post");
            },
            { rollback: true },
        );
    });
});
