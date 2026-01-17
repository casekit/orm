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

describe("createMany", () => {
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

    test("creates multiple records with full values and returns specified fields", async () => {
        await db.transact(
            async (db) => {
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Test User 1",
                            email: "user1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Test User 2",
                            email: "user2@example.com",
                            role: "admin",
                        },
                    ],
                    returning: ["id", "name", "role"],
                });

                expect(users).toHaveLength(2);
                expect(users[0]).toEqual({
                    id: 1,
                    name: "Test User 1",
                    role: "user",
                });
                expect(users[1]).toEqual({
                    id: 2,
                    name: "Test User 2",
                    role: "admin",
                });

                // Verify records were actually created
                const foundUsers = await db.findMany("user", {
                    select: ["id", "name", "role"],
                    orderBy: ["name"],
                });

                expect(foundUsers).toEqual(users);
            },
            { rollback: true },
        );
    });

    test("creates records with minimal values using defaults", async () => {
        await db.transact(
            async (db) => {
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Test User 1",
                            email: "user1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Test User 2",
                            email: "user2@example.com",
                            role: "user",
                        },
                    ],
                    returning: ["id", "name", "deletedAt"],
                });

                expect(users).toHaveLength(2);
                users.forEach((user) => {
                    expect(user.deletedAt).toBeNull();
                });
            },
            { rollback: true },
        );
    });

    test("returns row count when no returning clause specified", async () => {
        await db.transact(
            async (db) => {
                const result = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Test User 1",
                            email: "user1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Test User 2",
                            email: "user2@example.com",
                            role: "user",
                        },
                    ],
                });

                expect(result).toBe(2);

                // Verify records were created
                const users = await db.findMany("user", {
                    select: ["id"],
                });
                expect(users).toHaveLength(2);
            },
            { rollback: true },
        );
    });

    test("handles empty values array", async () => {
        await db.transact(
            async (db) => {
                const result = await db.createMany("user", {
                    values: [],
                    returning: ["id", "name"],
                });

                expect(result).toEqual([]);
            },
            { rollback: true },
        );
    });

    test("throws error on constraint violation", async () => {
        await db.transact(
            async (db) => {
                const email = "same@example.com";

                // Create first user
                await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "First User",
                        email,
                        role: "user",
                    },
                });

                // Try to create more users with same email and deletedAt as null (unique constraint)
                await expect(
                    db.createMany("user", {
                        values: [
                            {
                                id: 1,
                                name: "Second User",
                                email, // Duplicate email with same deletedAt (null)
                                role: "user",
                            },
                        ],
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

                // Create first user
                const user1 = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Original User",
                        email,
                        role: "user",
                    },
                    returning: ["id", "name"],
                });

                // Try to create users including one with same email
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1, // Same ID
                            name: "Duplicate User",
                            email,
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "New User",
                            email: "new@example.com",
                            role: "user",
                        },
                    ],
                    onConflict: { do: "nothing" },
                    returning: ["id", "name"],
                });

                // Should only return the non-conflicting user
                expect(users).toHaveLength(1);
                expect(users[0]!.name).toBe("New User");

                // Original user should be unchanged
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

                // Create first user
                await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Original User",
                        email,
                        role: "user",
                    },
                });

                // Try to create users including one with same email
                const result = await db.createMany("user", {
                    values: [
                        {
                            id: 2,
                            name: "Duplicate User",
                            email,
                            role: "user",
                        },
                        {
                            id: 3,
                            name: "New User",
                            email: "new@example.com",
                            role: "user",
                        },
                    ],
                    onConflict: { do: "nothing" },
                });

                // Should return count of only the inserted rows
                expect(result).toBe(1);
            },
            { rollback: true },
        );
    });

    test("handles enum fields in values", async () => {
        await db.transact(
            async (db) => {
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Admin User",
                            email: "admin@example.com",
                            role: "admin",
                        },
                        {
                            id: 2,
                            name: "Regular User",
                            email: "user@example.com",
                            role: "user",
                        },
                    ],
                    returning: ["id", "name", "role"],
                });

                expect(users).toEqual([
                    {
                        id: 1,
                        name: "Admin User",
                        role: "admin",
                    },
                    {
                        id: 2,
                        name: "Regular User",
                        role: "user",
                    },
                ]);

                const foundUsers = await db.findMany("user", {
                    select: ["id", "name", "role"],
                    orderBy: ["id"],
                });
                expect(foundUsers).toEqual(users);
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

                const posts = await db.createMany("post", {
                    values: [
                        {
                            title: "First Post",
                            content: "First Content",
                            authorId: user.id,
                            tags: ["first", "test", "tags"],
                            metadata: {
                                foo: "a",
                                bar: [{ baz: "good", quux: true }],
                            },
                        },
                        {
                            title: "Second Post",
                            content: "Second Content",
                            authorId: user.id,
                            tags: ["second", "example", "array"],
                            metadata: {
                                foo: "b",
                                bar: [
                                    { baz: "bad", quux: false },
                                    { baz: "good", quux: true },
                                ],
                            },
                        },
                        {
                            title: "Third Post",
                            content: "Third Content",
                            authorId: user.id,
                            tags: ["third"],
                            metadata: {
                                foo: "c",
                                bar: [{ baz: "indifferent", quux: true }],
                            },
                        },
                    ],
                    returning: ["id", "title", "tags", "metadata"],
                });

                expect(posts).toHaveLength(3);
                expect(posts[0]).toEqual({
                    id: expect.any(Number),
                    title: "First Post",
                    tags: ["first", "test", "tags"],
                    metadata: {
                        foo: "a",
                        bar: [{ baz: "good", quux: true }],
                    },
                });
                expect(posts[1]).toEqual({
                    id: expect.any(Number),
                    title: "Second Post",
                    tags: ["second", "example", "array"],
                    metadata: {
                        foo: "b",
                        bar: [
                            { baz: "bad", quux: false },
                            { baz: "good", quux: true },
                        ],
                    },
                });
                expect(posts[2]).toEqual({
                    id: expect.any(Number),
                    title: "Third Post",
                    tags: ["third"],
                    metadata: {
                        foo: "c",
                        bar: [{ baz: "indifferent", quux: true }],
                    },
                });

                // Verify the array and JSON fields were stored correctly
                const foundPosts = await db.findMany("post", {
                    select: ["id", "title", "tags", "metadata"],
                    orderBy: ["id"],
                });
                expect(foundPosts).toEqual(posts);
            },
            { rollback: true },
        );
    });

    // TODO comment back in once relationships are implemented
    test.skip("can create posts with relationship to user", async () => {
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

                // Create multiple posts for the user
                const posts = await db.createMany("post", {
                    values: [
                        {
                            title: "First Post",
                            content: "Hello World 1",
                            authorId: user.id,
                        },
                        {
                            title: "Second Post",
                            content: "Hello World 2",
                            authorId: user.id,
                        },
                    ],
                    returning: ["id", "title", "authorId"],
                });

                expect(posts).toHaveLength(2);
                posts.forEach((post) => {
                    expect(post.authorId).toBe(user.id);
                    expect(post).toHaveProperty("title");
                    expect(post).toHaveProperty("id");
                });

                // Verify the relationship works
                const userWithPosts = await db.findOne("user", {
                    select: ["id"],
                    include: {
                        posts: {
                            select: ["id", "title"],
                        },
                    },
                    where: { id: user.id },
                });

                expect(userWithPosts.posts).toHaveLength(2);
            },
            { rollback: true },
        );
    });
});
