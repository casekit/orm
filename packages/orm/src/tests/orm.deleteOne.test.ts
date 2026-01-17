import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { $and, $like } from "../operators.js";
import { Orm, orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("deleteOne", () => {
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

    test("deletes single record and returns count when no returning clause specified", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Delete User",
                            email: "delete@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Keep User 1",
                            email: "keep1@example.com",
                            role: "user",
                        },
                        {
                            id: 3,
                            name: "Keep User 2",
                            email: "keep2@example.com",
                            role: "admin",
                        },
                    ],
                });

                const result = await db.deleteOne("user", {
                    where: { id: 1 },
                });

                expect(result).toBe(1);

                const remainingUsers = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
                expect(remainingUsers).toEqual([
                    { id: 2, name: "Keep User 1" },
                    { id: 3, name: "Keep User 2" },
                ]);
            },
            { rollback: true },
        );
    });

    test("deletes single record and returns specified fields", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Delete User",
                            email: "delete@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Keep User 1",
                            email: "keep1@example.com",
                            role: "admin",
                        },
                        {
                            id: 3,
                            name: "Keep User 2",
                            email: "keep2@example.com",
                            role: "user",
                        },
                    ],
                });

                const deletedUser = await db.deleteOne("user", {
                    where: { id: 1 },
                    returning: ["id", "name", "email", "role"],
                });

                expect(deletedUser).toEqual({
                    id: 1,
                    name: "Delete User",
                    email: "delete@example.com",
                    role: "user",
                });

                const remainingUsers = await db.findMany("user", {
                    select: ["id", "name", "email", "role"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
                expect(remainingUsers).toEqual([
                    {
                        id: 2,
                        name: "Keep User 1",
                        email: "keep1@example.com",
                        role: "admin",
                    },
                    {
                        id: 3,
                        name: "Keep User 2",
                        email: "keep2@example.com",
                        role: "user",
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("throws error when no records match delete criteria", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Keep User 1",
                            email: "keep1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Keep User 2",
                            email: "keep2@example.com",
                            role: "admin",
                        },
                    ],
                });

                await expect(
                    db.deleteOne("user", {
                        where: { id: 999999 },
                        returning: ["id", "name"],
                    }),
                ).rejects.toThrow("Delete one failed to delete a row");

                const remainingUsers = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
                expect(remainingUsers).toEqual([
                    { id: 1, name: "Keep User 1" },
                    { id: 2, name: "Keep User 2" },
                ]);
            },
            { rollback: true },
        );
    });

    test("throws error when multiple records would be deleted", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "User 1",
                            email: "user1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "User 2",
                            email: "user2@example.com",
                            role: "user",
                        },
                        {
                            id: 3,
                            name: "Admin",
                            email: "admin@example.com",
                            role: "admin",
                        },
                    ],
                });

                await expect(
                    db.deleteOne("user", {
                        where: { role: "user" },
                    }),
                ).rejects.toThrow(
                    "Delete one would have deleted more than one row",
                );

                const remainingUsers = await db.findMany("user", {
                    select: ["id"],
                });
                expect(remainingUsers).toHaveLength(3);
            },
            { rollback: true },
        );
    });

    test("deletes record matching complex where clause including enum values", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Keep Regular User",
                            email: "keep@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Delete Admin",
                            email: "admin@example.com",
                            role: "admin",
                        },
                        {
                            id: 3,
                            name: "Keep Another Admin",
                            email: "keep-admin@example.com",
                            role: "admin",
                        },
                    ],
                });

                const result = await db.deleteOne("user", {
                    where: {
                        [$and]: [
                            { role: "admin" },
                            { email: { [$like]: "%@example.com" } },
                            { name: { [$like]: "%Delete%" } },
                        ],
                    },
                    returning: ["id", "role", "email"],
                });

                expect(result).toEqual({
                    id: 2,
                    role: "admin",
                    email: "admin@example.com",
                });

                const remainingUsers = await db.findMany("user", {
                    select: ["id", "name", "role"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
                expect(remainingUsers).toEqual([
                    {
                        id: 1,
                        name: "Keep Regular User",
                        role: "user",
                    },
                    {
                        id: 3,
                        name: "Keep Another Admin",
                        role: "admin",
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("handles array and JSON fields in returning clause", async () => {
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

                await db.createMany("post", {
                    values: [
                        {
                            id: 1,
                            title: "Delete Post",
                            content: "Content 1",
                            authorId: user.id,
                            tags: ["delete", "test", "post1"],
                            metadata: {
                                foo: "a",
                                bar: [{ baz: "good", quux: true }],
                            },
                        },
                        {
                            id: 2,
                            title: "Keep Post 1",
                            content: "Content 2",
                            authorId: user.id,
                            tags: ["keep", "test", "post2"],
                            metadata: {
                                foo: "b",
                                bar: [{ baz: "bad", quux: false }],
                            },
                        },
                        {
                            id: 3,
                            title: "Keep Post 2",
                            content: "Content 3",
                            authorId: user.id,
                            tags: ["keep", "test"],
                            metadata: {
                                foo: "c",
                                bar: [{ baz: "indifferent", quux: true }],
                            },
                        },
                    ],
                });

                const result = await db.deleteOne("post", {
                    where: { id: 1 },
                    returning: ["id", "tags", "metadata"],
                });

                expect(result).toEqual({
                    id: 1,
                    tags: ["delete", "test", "post1"],
                    metadata: {
                        foo: "a",
                        bar: [{ baz: "good", quux: true }],
                    },
                });

                const remainingPosts = await db.findMany("post", {
                    select: ["id", "title", "tags", "metadata"],
                    orderBy: ["id"],
                });
                expect(remainingPosts).toHaveLength(2);
                expect(remainingPosts).toEqual([
                    {
                        id: 2,
                        title: "Keep Post 1",
                        tags: ["keep", "test", "post2"],
                        metadata: {
                            foo: "b",
                            bar: [{ baz: "bad", quux: false }],
                        },
                    },
                    {
                        id: 3,
                        title: "Keep Post 2",
                        tags: ["keep", "test"],
                        metadata: {
                            foo: "c",
                            bar: [{ baz: "indifferent", quux: true }],
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("throws error when deleting record would violate foreign key constraints", async () => {
        await db.transact(
            async (db) => {
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "User with Posts",
                            email: "posts@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Keep User",
                            email: "keep@example.com",
                            role: "admin",
                        },
                    ],
                    returning: ["id"],
                });

                await db.createOne("post", {
                    values: {
                        title: "Test Post",
                        content: "Content",
                        authorId: users[0]!.id,
                    },
                });

                await expect(
                    db.deleteOne("user", {
                        where: { id: users[0]!.id },
                    }),
                ).rejects.toThrow();

                const remainingUsers = await db.findMany("user", {
                    select: ["id"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
            },
            { rollback: true },
        );
    });
});
