import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { $and, $in, $like, $or } from "../operators.js";
import { Orm, orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("deleteMany", () => {
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

    test("deletes multiple records and returns count when no returning clause specified", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Delete User 1",
                            email: "delete1@example.com",
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
                            name: "Delete User 2",
                            email: "delete2@example.com",
                            role: "admin",
                        },
                        {
                            id: 4,
                            name: "Keep User 2",
                            email: "keep2@example.com",
                            role: "user",
                        },
                    ],
                });

                const result = await db.deleteMany("user", {
                    where: { id: { [$in]: [1, 3] } },
                });

                expect(result).toBe(2);

                const remainingUsers = await db.findMany("user", {
                    select: ["id", "name"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
                expect(remainingUsers).toEqual([
                    { id: 2, name: "Keep User 1" },
                    { id: 4, name: "Keep User 2" },
                ]);
            },
            { rollback: true },
        );
    });

    test("deletes multiple records and returns specified fields", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "Delete User 1",
                            email: "delete1@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "Delete User 2",
                            email: "delete2@example.com",
                            role: "admin",
                        },
                        {
                            id: 3,
                            name: "Keep User",
                            email: "keep@example.com",
                            role: "user",
                        },
                    ],
                });

                const deletedUsers = await db.deleteMany("user", {
                    where: { id: { [$in]: [1, 2] } },
                    returning: ["id", "name", "email", "role"],
                });

                expect(deletedUsers).toHaveLength(2);
                expect(deletedUsers).toEqual([
                    {
                        id: 1,
                        name: "Delete User 1",
                        email: "delete1@example.com",
                        role: "user",
                    },
                    {
                        id: 2,
                        name: "Delete User 2",
                        email: "delete2@example.com",
                        role: "admin",
                    },
                ]);

                const remainingUser = await db.findOne("user", {
                    select: ["id", "name", "email", "role"],
                    where: { id: 3 },
                });
                expect(remainingUser).toEqual({
                    id: 3,
                    name: "Keep User",
                    email: "keep@example.com",
                    role: "user",
                });
            },
            { rollback: true },
        );
    });

    test("returns empty array when no records match delete criteria", async () => {
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

                const result = await db.deleteMany("user", {
                    where: { id: 999999 },
                    returning: ["id", "name"],
                });

                expect(result).toEqual([]);

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

    test("returns zero when no records match delete criteria and no returning clause", async () => {
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

                const result = await db.deleteMany("user", {
                    where: { id: 999999 },
                });

                expect(result).toBe(0);

                const remainingUsers = await db.findMany("user", {
                    select: ["id"],
                });
                expect(remainingUsers).toHaveLength(2);
            },
            { rollback: true },
        );
    });

    test("deletes records matching complex where clause including enum values", async () => {
        await db.transact(
            async (db) => {
                // Create test users with different roles and emails
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
                            name: "Delete User",
                            email: "delete@example.com",
                            role: "user",
                        },
                        {
                            id: 4,
                            name: "Keep Another Admin",
                            email: "keep-admin@example.com",
                            role: "admin",
                        },
                    ],
                });

                const result = await db.deleteMany("user", {
                    where: {
                        [$or]: [
                            {
                                [$and]: [
                                    { role: "admin" },
                                    { email: { [$like]: "%@example.com" } },
                                    { name: { [$like]: "%Delete%" } },
                                ],
                            },
                            { email: "delete@example.com" },
                        ],
                    },
                    returning: ["id", "role", "email"],
                });

                expect(result).toHaveLength(2);
                expect(result).toEqual([
                    {
                        id: 2,
                        role: "admin",
                        email: "admin@example.com",
                    },
                    {
                        id: 3,
                        role: "user",
                        email: "delete@example.com",
                    },
                ]);

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
                        id: 4,
                        name: "Keep Another Admin",
                        role: "admin",
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("handles array, enum, and JSON fields in returning clause", async () => {
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
                            title: "Delete Post 1",
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
                            title: "Delete Post 2",
                            content: "Content 2",
                            authorId: user.id,
                            tags: ["delete", "test", "post2"],
                            metadata: {
                                foo: "b",
                                bar: [{ baz: "bad", quux: false }],
                            },
                        },
                        {
                            id: 3,
                            title: "Keep Post",
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

                const result = await db.deleteMany("post", {
                    where: {
                        tags: {
                            [$in]: [
                                ["delete", "test", "post1"],
                                ["delete", "test", "post2"],
                            ],
                        },
                    },
                    returning: ["id", "tags", "metadata"],
                });

                expect(result).toHaveLength(2);
                expect(result).toEqual([
                    {
                        id: 1,
                        tags: ["delete", "test", "post1"],
                        metadata: {
                            foo: "a",
                            bar: [{ baz: "good", quux: true }],
                        },
                    },
                    {
                        id: 2,
                        tags: ["delete", "test", "post2"],
                        metadata: {
                            foo: "b",
                            bar: [{ baz: "bad", quux: false }],
                        },
                    },
                ]);

                const remainingPost = await db.findOne("post", {
                    select: ["id", "title", "tags", "metadata"],
                    where: { id: 3 },
                });
                expect(remainingPost).toEqual({
                    id: 3,
                    title: "Keep Post",
                    tags: ["keep", "test"],
                    metadata: {
                        foo: "c",
                        bar: [{ baz: "indifferent", quux: true }],
                    },
                });
            },
            { rollback: true },
        );
    });

    test("throws error when deleting records would violate foreign key constraints", async () => {
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
                            name: "User to Delete",
                            email: "delete@example.com",
                            role: "user",
                        },
                        {
                            id: 3,
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
                    db.deleteMany("user", {
                        where: { role: "user" },
                    }),
                ).rejects.toThrow();

                const remainingUsers = await db.findMany("user", {
                    select: ["id"],
                    orderBy: ["id"],
                });
                expect(remainingUsers).toHaveLength(3);
            },
            { rollback: true },
        );
    });
});
