import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { $in, $like, $not } from "../operators.js";
import { Orm, orm } from "../orm.js";
import { Middleware } from "../types/Middleware.js";
import { mockLogger } from "./util/logger.js";

const softdelete = (): Middleware => ({
    where: (config, modelName, where) => {
        if ("deletedAt" in (config.models[modelName]?.fields ?? {})) {
            return { deletedAt: null, ...where };
        } else {
            return where;
        }
    },
});

describe("where middleware", () => {
    const logger = mockLogger();
    let db: Orm<typeof config>;

    beforeEach(() => {
        logger.clear();
    });

    beforeAll(async () => {
        db = orm({ ...config, logger }).middleware([softdelete()]);
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    describe("findOne and findMany", () => {
        test("applies to top level where clauses", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 1,
                                name: "Test User",
                                email: "test@example.com",
                                role: "user",
                            },
                            {
                                id: 2,
                                name: "Test User 2",
                                email: "test2@example.com",
                                role: "user",
                            },
                        ],
                        returning: ["id"],
                    });

                    const usersBeforeDelete = await db.findMany("user", {
                        select: ["id", "name", "email", "deletedAt"],
                        orderBy: ["id"],
                    });

                    expect(usersBeforeDelete).toEqual([
                        {
                            id: 1,
                            name: "Test User",
                            email: "test@example.com",
                            deletedAt: null,
                        },
                        {
                            id: 2,
                            name: "Test User 2",
                            email: "test2@example.com",
                            deletedAt: null,
                        },
                    ]);

                    await db.updateOne("user", {
                        where: { id: 1 },
                        set: { deletedAt: new Date() },
                    });

                    const usersAfterDelete = await db.findMany("user", {
                        select: ["id", "name", "email", "deletedAt"],
                        orderBy: ["id"],
                    });

                    expect(usersAfterDelete).toEqual([
                        {
                            id: 2,
                            name: "Test User 2",
                            email: "test2@example.com",
                            deletedAt: null,
                        },
                    ]);
                },
                { rollback: true },
            );
        });

        test("middleware is still applied after orm.restrict", async () => {
            const restrictedDb = db.restrict(["user", "post"]);

            await restrictedDb.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 3,
                                name: "Test User 3",
                                email: "test3@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 4,
                                name: "Test User 4",
                                email: "test4@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                        returning: ["id"],
                    });

                    const users = await db.findMany("user", {
                        select: ["id", "name", "email", "deletedAt"],
                        orderBy: ["id"],
                    });

                    expect(users).toEqual([
                        {
                            id: 3,
                            name: "Test User 3",
                            email: "test3@example.com",
                            deletedAt: null,
                        },
                    ]);

                    const count = await db.count("user", {});
                    expect(count).toBe(1);
                },
                { rollback: true },
            );
        });

        test("applies to N:1 relations without where clause", async () => {
            await db.transact(
                async (db) => {
                    const activeUser = await db.createOne("user", {
                        values: {
                            id: 5,
                            name: "Active User",
                            email: "active@example.com",
                            role: "user",
                        },
                        returning: ["id"],
                    });

                    const deletedUser = await db.createOne("user", {
                        values: {
                            id: 6,
                            name: "Deleted User",
                            email: "deleted@example.com",
                            role: "user",
                            deletedAt: new Date(),
                        },
                        returning: ["id"],
                    });

                    await db.createOne("post", {
                        values: {
                            id: 1,
                            title: "Post by Active User",
                            content: "Content",
                            authorId: activeUser.id,
                        },
                    });

                    await db.createOne("post", {
                        values: {
                            id: 2,
                            title: "Post by Deleted User",
                            content: "Content",
                            authorId: deletedUser.id,
                        },
                    });

                    // Without where clause on relation - should still filter deleted author
                    const posts = await db.findMany("post", {
                        select: ["id", "title"],
                        include: {
                            author: {
                                select: ["id", "name"],
                            },
                        },
                        orderBy: ["id"],
                    });

                    expect(posts).toHaveLength(1);
                    expect(posts).toEqual([
                        {
                            id: 1,
                            title: "Post by Active User",
                            author: {
                                id: 5,
                                name: "Active User",
                            },
                        },
                    ]);
                },
                { rollback: true },
            );
        });

        test("applies to N:1 relations with where clause", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 7,
                                name: "Admin User",
                                email: "admin@example.com",
                                role: "admin",
                            },
                            {
                                id: 8,
                                name: "Regular User",
                                email: "regular@example.com",
                                role: "user",
                            },
                            {
                                id: 9,
                                name: "Deleted Admin",
                                email: "deleted-admin@example.com",
                                role: "admin",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    await db.createMany("post", {
                        values: [
                            {
                                id: 3,
                                title: "Post by Admin",
                                content: "Content",
                                authorId: 7,
                                deletedAt: null,
                            },
                            {
                                id: 4,
                                title: "Post by Regular User",
                                content: "Content",
                                authorId: 8,
                                deletedAt: null,
                            },
                            {
                                id: 5,
                                title: "Post by Deleted Admin",
                                content: "Content",
                                authorId: 9,
                                deletedAt: null,
                            },
                        ],
                    });

                    // With where clause on relation - should combine with middleware
                    const posts = await db.findMany("post", {
                        select: ["id", "title"],
                        include: {
                            author: {
                                select: ["id", "name", "role"],
                                where: { role: "admin" },
                            },
                        },
                        orderBy: ["id"],
                    });

                    expect(posts).toHaveLength(1);
                    expect(posts).toEqual([
                        {
                            author: {
                                id: 7,
                                name: "Admin User",
                                role: "admin",
                            },
                            id: 3,
                            title: "Post by Admin",
                        },
                    ]);
                },
                { rollback: true },
            );
        });

        test("applies to 1:N relations without where clause", async () => {
            await db.transact(
                async (db) => {
                    const user = await db.createOne("user", {
                        values: {
                            id: 10,
                            name: "Post Author",
                            email: "author@example.com",
                            role: "user",
                        },
                        returning: ["id"],
                    });

                    await db.createMany("post", {
                        values: [
                            {
                                id: 6,
                                title: "Active Post 1",
                                content: "Content",
                                authorId: user.id,
                            },
                            {
                                id: 7,
                                title: "Deleted Post",
                                content: "Content",
                                authorId: user.id,
                                deletedAt: new Date(),
                            },
                            {
                                id: 8,
                                title: "Active Post 2",
                                content: "Content",
                                authorId: user.id,
                            },
                        ],
                    });

                    const result = await db.findOne("user", {
                        select: ["id", "name"],
                        include: {
                            posts: {
                                select: ["id", "title", "deletedAt"],
                                orderBy: ["id"],
                            },
                        },
                        where: { id: user.id },
                    });

                    expect(result.posts).toHaveLength(2);
                    expect(result.posts[0]?.title).toBe("Active Post 1");
                    expect(result.posts[1]?.title).toBe("Active Post 2");
                },
                { rollback: true },
            );
        });

        test("applies to 1:N relations with where clause", async () => {
            await db.transact(
                async (db) => {
                    const user = await db.createOne("user", {
                        values: {
                            id: 11,
                            name: "Post Author 2",
                            email: "author2@example.com",
                            role: "user",
                        },
                        returning: ["id"],
                    });

                    await db.createMany("post", {
                        values: [
                            {
                                id: 9,
                                title: "Short Post",
                                content: "Short",
                                authorId: user.id,
                            },
                            {
                                id: 10,
                                title: "Long Post",
                                content:
                                    "This is a long post with lots of content",
                                authorId: user.id,
                            },
                            {
                                id: 11,
                                title: "Deleted Long Post",
                                content: "This was a long post but now deleted",
                                authorId: user.id,
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    const result = await db.findOne("user", {
                        select: ["id", "name"],
                        include: {
                            posts: {
                                select: ["id", "title", "content"],
                                where: { content: { [$like]: "%long%" } },
                                orderBy: ["id"],
                            },
                        },
                        where: { id: user.id },
                    });

                    expect(result.posts).toHaveLength(1);
                    expect(result.posts[0]?.title).toBe("Long Post");
                },
                { rollback: true },
            );
        });

        test("applies to N:N relations", async () => {
            await db.transact(
                async (db) => {
                    const [activeUser, deletedUser, anotherUser] =
                        await db.createMany("user", {
                            values: [
                                {
                                    id: 12,
                                    name: "Active User with Friends",
                                    email: "active-friends@example.com",
                                    role: "user",
                                },
                                {
                                    id: 13,
                                    name: "Deleted Friend",
                                    email: "deleted-friend@example.com",
                                    role: "user",
                                    deletedAt: new Date(),
                                },
                                {
                                    id: 14,
                                    name: "Another Active Friend",
                                    email: "another-friend@example.com",
                                    role: "user",
                                },
                            ],
                            returning: ["id"],
                        });

                    await db.createMany("friendship", {
                        values: [
                            {
                                userId: activeUser!.id,
                                friendId: deletedUser!.id,
                            },
                            {
                                userId: activeUser!.id,
                                friendId: anotherUser!.id,
                            },
                        ],
                    });

                    const result = await db.findOne("user", {
                        select: ["id", "name"],
                        include: {
                            friends: {
                                select: ["id", "name"],
                                orderBy: ["id"],
                            },
                        },
                        where: { id: activeUser!.id },
                    });

                    expect(result.friends).toHaveLength(1);
                    expect(result.friends[0]?.name).toBe(
                        "Another Active Friend",
                    );
                },
                { rollback: true },
            );
        });

        test("applies to multiple levels of nested relations", async () => {
            await db.transact(
                async (db) => {
                    const [activeUser, deletedUser, anotherActiveUser] =
                        await db.createMany("user", {
                            values: [
                                {
                                    id: 15,
                                    name: "Active User Multi Level",
                                    email: "active-multi@example.com",
                                    role: "user",
                                },
                                {
                                    id: 16,
                                    name: "Deleted User Multi Level",
                                    email: "deleted-multi@example.com",
                                    role: "user",
                                    deletedAt: new Date(),
                                },
                                {
                                    id: 17,
                                    name: "Another Active User",
                                    email: "another-active@example.com",
                                    role: "user",
                                },
                            ],
                            returning: ["id"],
                        });

                    const [activePost, deletedPost] = await db.createMany(
                        "post",
                        {
                            values: [
                                {
                                    id: 12,
                                    title: "Active Post Multi",
                                    content: "Content",
                                    authorId: activeUser!.id,
                                },
                                {
                                    id: 13,
                                    title: "Deleted Post Multi",
                                    content: "Content",
                                    authorId: activeUser!.id,
                                    deletedAt: new Date(),
                                },
                            ],
                            returning: ["id"],
                        },
                    );

                    await db.createMany("like", {
                        values: [
                            {
                                id: 1,
                                postId: activePost!.id,
                                userId: anotherActiveUser!.id,
                            },
                            {
                                id: 2,
                                postId: activePost!.id,
                                userId: deletedUser!.id,
                            },
                            {
                                id: 3,
                                postId: deletedPost!.id,
                                userId: anotherActiveUser!.id,
                            },
                        ],
                    });

                    const result = await db.findOne("user", {
                        select: ["id", "name"],
                        include: {
                            posts: {
                                select: ["id", "title"],
                                include: {
                                    likes: {
                                        select: ["id"],
                                        include: {
                                            user: {
                                                select: ["id", "name"],
                                            },
                                        },
                                        orderBy: ["id"],
                                    },
                                },
                                orderBy: ["id"],
                            },
                        },
                        where: { id: activeUser!.id },
                    });

                    // Should only have 1 active post
                    expect(result.posts).toHaveLength(1);
                    expect(result.posts[0]?.title).toBe("Active Post Multi");

                    // Should only have 1 like (like by deleted user filtered)
                    expect(result.posts[0]?.likes).toHaveLength(1);
                    expect(result.posts[0]?.likes[0]?.user.name).toBe(
                        "Another Active User",
                    );
                },
                { rollback: true },
            );
        });
    });

    describe("updateOne", () => {
        test("applies middleware to prevent updating soft-deleted records", async () => {
            await db.transact(
                async (db) => {
                    // Create two users, one active and one soft-deleted
                    await db.createMany("user", {
                        values: [
                            {
                                id: 100,
                                name: "Active User",
                                email: "active@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 101,
                                name: "Deleted User",
                                email: "deleted@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Try to update the deleted user - should throw because middleware prevents finding it
                    await expect(
                        db.updateOne("user", {
                            where: { id: 101 },
                            set: { name: "Should Not Update" },
                            returning: ["id", "name"],
                        }),
                    ).rejects.toThrow("Update one failed to update a row");

                    // Verify the deleted user wasn't updated by explicitly querying soft-deleted records
                    const deletedUser = await db.findMany("user", {
                        where: { id: 101, deletedAt: { [$not]: null } },
                        select: ["name", "deletedAt"],
                    });
                    // Should find the soft-deleted user with original name
                    expect(deletedUser).toHaveLength(1);
                    expect(deletedUser[0]?.name).toBe("Deleted User");
                    expect(deletedUser[0]?.deletedAt).toBeTruthy();

                    // Update the active user - should work
                    const activeResult = await db.updateOne("user", {
                        where: { id: 100 },
                        set: { name: "Updated Active User" },
                        returning: ["id", "name"],
                    });

                    expect(activeResult).toEqual({
                        id: 100,
                        name: "Updated Active User",
                    });
                },
                { rollback: true },
            );
        });

        test("combines explicit where conditions with middleware", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 102,
                                name: "Admin User",
                                email: "admin@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 103,
                                name: "Regular User",
                                email: "regular@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 104,
                                name: "Deleted Admin",
                                email: "deleted-admin@example.com",
                                role: "admin",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Update only admin users - should skip deleted admin
                    const result = await db.updateOne("user", {
                        where: { role: "admin" },
                        set: { name: "Updated Admin" },
                        returning: ["id", "name"],
                    });

                    expect(result).toEqual({
                        id: 102,
                        name: "Updated Admin",
                    });

                    // Verify deleted admin wasn't updated by explicitly querying soft-deleted records
                    const deletedAdmins = await db.findMany("user", {
                        where: { id: 104, deletedAt: { [$not]: null } },
                        select: ["name", "deletedAt"],
                    });
                    // Should find the soft-deleted admin with original name
                    expect(deletedAdmins).toHaveLength(1);
                    expect(deletedAdmins[0]?.name).toBe("Deleted Admin");
                    expect(deletedAdmins[0]?.deletedAt).toBeTruthy();
                },
                { rollback: true },
            );
        });
    });

    describe("updateMany", () => {
        test("applies middleware to prevent updating soft-deleted records", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 105,
                                name: "Active User 1",
                                email: "active1@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 106,
                                name: "Active User 2",
                                email: "active2@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 107,
                                name: "Deleted User",
                                email: "deleted@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Update all users - should only update active ones
                    const count = await db.updateMany("user", {
                        where: { id: { [$in]: [105, 106, 107] } },
                        set: { name: "Bulk Updated" },
                    });

                    expect(count).toBe(2);

                    // Verify only active users are visible and were updated
                    const visibleUsers = await db.findMany("user", {
                        where: { id: { [$in]: [105, 106, 107] } },
                        select: ["id", "name"],
                        orderBy: ["id"],
                    });

                    // Should only see the 2 active users that were updated (deleted user not visible due to middleware)
                    expect(visibleUsers).toHaveLength(2);
                    expect(visibleUsers).toEqual([
                        { id: 105, name: "Bulk Updated" },
                        { id: 106, name: "Bulk Updated" },
                    ]);

                    // Verify the deleted user wasn't updated by explicitly querying soft-deleted records
                    const deletedUser = await db.findMany("user", {
                        where: { id: 107, deletedAt: { [$not]: null } },
                        select: ["name", "deletedAt"],
                    });
                    // Should find the soft-deleted user with original name
                    expect(deletedUser).toHaveLength(1);
                    expect(deletedUser[0]?.name).toBe("Deleted User");
                    expect(deletedUser[0]?.deletedAt).toBeTruthy();
                },
                { rollback: true },
            );
        });

        test("combines explicit where conditions with middleware", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 108,
                                name: "Admin 1",
                                email: "admin1@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 109,
                                name: "Admin 2",
                                email: "admin2@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 110,
                                name: "User 1",
                                email: "user1@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 111,
                                name: "Deleted Admin",
                                email: "deleted-admin@example.com",
                                role: "admin",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Update only admins - should skip deleted admin
                    const count = await db.updateMany("user", {
                        where: { role: "admin" },
                        set: { name: "Updated Admin" },
                    });

                    expect(count).toBe(2);

                    // Verify only active users are visible and correct ones were updated
                    const visibleUsers = await db.findMany("user", {
                        where: { id: { [$in]: [108, 109, 110, 111] } },
                        select: ["id", "name", "role"],
                        orderBy: ["id"],
                    });

                    // Should only see the 3 active users (deleted admin not visible due to middleware)
                    expect(visibleUsers).toHaveLength(3);
                    expect(visibleUsers).toEqual([
                        { id: 108, name: "Updated Admin", role: "admin" },
                        { id: 109, name: "Updated Admin", role: "admin" },
                        { id: 110, name: "User 1", role: "user" },
                    ]);

                    // Verify the deleted admin wasn't updated by explicitly querying soft-deleted records
                    const deletedAdmin = await db.findMany("user", {
                        where: { id: 111, deletedAt: { [$not]: null } },
                        select: ["name", "deletedAt"],
                    });
                    // Should find the soft-deleted admin with original name
                    expect(deletedAdmin).toHaveLength(1);
                    expect(deletedAdmin[0]?.name).toBe("Deleted Admin");
                    expect(deletedAdmin[0]?.deletedAt).toBeTruthy();
                },
                { rollback: true },
            );
        });
    });

    describe("deleteOne", () => {
        test("applies middleware to prevent deleting already soft-deleted records", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 112,
                                name: "Active User",
                                email: "active@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 113,
                                name: "Soft Deleted User",
                                email: "deleted@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Try to delete the already soft-deleted user - should throw because middleware prevents finding it
                    await expect(
                        db.deleteOne("user", {
                            where: { id: 113 },
                            returning: ["id"],
                        }),
                    ).rejects.toThrow("Delete one failed to delete a row");

                    // Verify the soft-deleted user still exists and wasn't hard-deleted
                    const deletedUsers = await db.findMany("user", {
                        where: { id: 113, deletedAt: { [$not]: null } },
                        select: ["id", "name", "deletedAt"],
                    });
                    // Should find the soft-deleted user unchanged
                    expect(deletedUsers).toHaveLength(1);
                    expect(deletedUsers[0]?.name).toBe("Soft Deleted User");
                    expect(deletedUsers[0]?.deletedAt).toBeTruthy();

                    // Delete the active user - should work
                    const activeResult = await db.deleteOne("user", {
                        where: { id: 112 },
                        returning: ["id"],
                    });

                    expect(activeResult).toEqual({ id: 112 });

                    // Verify the active user was deleted - should not be found
                    const activeUsers = await db.findMany("user", {
                        where: { id: 112 },
                        select: ["id"],
                    });
                    expect(activeUsers).toHaveLength(0);
                },
                { rollback: true },
            );
        });

        test("combines explicit where conditions with middleware", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 114,
                                name: "Admin User",
                                email: "admin@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 115,
                                name: "Regular User",
                                email: "regular@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 116,
                                name: "Deleted Admin",
                                email: "deleted-admin@example.com",
                                role: "admin",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Delete admin users - should skip soft-deleted admin
                    const result = await db.deleteOne("user", {
                        where: { role: "admin" },
                        returning: ["id", "name"],
                    });

                    expect(result).toEqual({
                        id: 114,
                        name: "Admin User",
                    });

                    // Verify only the regular user remains visible (soft-deleted admin not visible due to middleware)
                    const remainingUsers = await db.findMany("user", {
                        where: { id: { [$in]: [114, 115, 116] } },
                        select: ["id", "role"],
                        orderBy: ["id"],
                    });

                    // Should only see the regular user (admin was deleted, soft-deleted admin not visible)
                    expect(remainingUsers).toHaveLength(1);
                    expect(remainingUsers).toEqual([{ id: 115, role: "user" }]);

                    // Verify the soft-deleted admin still exists and wasn't hard-deleted
                    const deletedAdmin = await db.findMany("user", {
                        where: { id: 116, deletedAt: { [$not]: null } },
                        select: ["id", "name", "deletedAt"],
                    });
                    // Should find the soft-deleted admin unchanged
                    expect(deletedAdmin).toHaveLength(1);
                    expect(deletedAdmin[0]?.name).toBe("Deleted Admin");
                    expect(deletedAdmin[0]?.deletedAt).toBeTruthy();
                },
                { rollback: true },
            );
        });
    });

    describe("deleteMany", () => {
        test("applies middleware to prevent deleting soft-deleted records", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 117,
                                name: "Active User 1",
                                email: "active1@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 118,
                                name: "Active User 2",
                                email: "active2@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 119,
                                name: "Deleted User",
                                email: "deleted@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Delete all users - should only delete active ones
                    const count = await db.deleteMany("user", {
                        where: { id: { [$in]: [117, 118, 119] } },
                    });

                    expect(count).toBe(2);

                    // Verify no users are visible (active ones deleted, soft-deleted one not visible due to middleware)
                    const remainingUsers = await db.findMany("user", {
                        where: { id: { [$in]: [117, 118, 119] } },
                        select: ["id", "deletedAt"],
                        orderBy: ["id"],
                    });

                    // Should see no users (active ones were deleted, soft-deleted one filtered out by middleware)
                    expect(remainingUsers).toHaveLength(0);

                    // Verify the soft-deleted user still exists and wasn't hard-deleted
                    const deletedUser = await db.findMany("user", {
                        where: { id: 119, deletedAt: { [$not]: null } },
                        select: ["id", "name", "deletedAt"],
                    });
                    // Should find the soft-deleted user unchanged
                    expect(deletedUser).toHaveLength(1);
                    expect(deletedUser[0]?.name).toBe("Deleted User");
                    expect(deletedUser[0]?.deletedAt).toBeTruthy();
                },
                { rollback: true },
            );
        });

        test("combines explicit where conditions with middleware", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 120,
                                name: "Admin 1",
                                email: "admin1@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 121,
                                name: "Admin 2",
                                email: "admin2@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 122,
                                name: "User 1",
                                email: "user1@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 123,
                                name: "Deleted Admin",
                                email: "deleted-admin@example.com",
                                role: "admin",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Delete only admins - should skip soft-deleted admin
                    const count = await db.deleteMany("user", {
                        where: { role: "admin" },
                    });

                    expect(count).toBe(2);

                    // Verify only the regular user remains visible (admins deleted, soft-deleted admin not visible due to middleware)
                    const remainingUsers = await db.findMany("user", {
                        where: { id: { [$in]: [120, 121, 122, 123] } },
                        select: ["id", "role"],
                        orderBy: ["id"],
                    });

                    // Should only see the regular user (admins were deleted, soft-deleted admin filtered out by middleware)
                    expect(remainingUsers).toHaveLength(1);
                    expect(remainingUsers).toEqual([{ id: 122, role: "user" }]);

                    // Verify the soft-deleted admin still exists and wasn't hard-deleted
                    const deletedAdmin = await db.findMany("user", {
                        where: { id: 123, deletedAt: { [$not]: null } },
                        select: ["id", "name", "deletedAt"],
                    });
                    // Should find the soft-deleted admin unchanged
                    expect(deletedAdmin).toHaveLength(1);
                    expect(deletedAdmin[0]?.name).toBe("Deleted Admin");
                    expect(deletedAdmin[0]?.deletedAt).toBeTruthy();
                },
                { rollback: true },
            );
        });
    });

    describe("count", () => {
        test("applies middleware to exclude soft-deleted records from count", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 124,
                                name: "Active User 1",
                                email: "active1@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 125,
                                name: "Active User 2",
                                email: "active2@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 126,
                                name: "Deleted User",
                                email: "deleted@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Count all users - should only count active ones
                    const count = await db.count("user", {});

                    expect(count).toBe(2);

                    // The test should pass as middleware correctly excludes soft-deleted records
                    // Count is working correctly by only counting active users
                },
                { rollback: true },
            );
        });

        test("combines explicit where conditions with middleware", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 127,
                                name: "Admin 1",
                                email: "admin1@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 128,
                                name: "Admin 2",
                                email: "admin2@example.com",
                                role: "admin",
                                deletedAt: null,
                            },
                            {
                                id: 129,
                                name: "User 1",
                                email: "user1@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 130,
                                name: "Deleted Admin",
                                email: "deleted-admin@example.com",
                                role: "admin",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Count only admins - should exclude soft-deleted admin
                    const count = await db.count("user", {
                        where: { role: "admin" },
                    });

                    expect(count).toBe(2);

                    // Count all users
                    const totalCount = await db.count("user", {});
                    expect(totalCount).toBe(3);
                },
                { rollback: true },
            );
        });

        test("applies middleware even with empty where clause", async () => {
            await db.transact(
                async (db) => {
                    await db.createMany("user", {
                        values: [
                            {
                                id: 131,
                                name: "Active User",
                                email: "active@example.com",
                                role: "user",
                                deletedAt: null,
                            },
                            {
                                id: 132,
                                name: "Deleted User",
                                email: "deleted@example.com",
                                role: "user",
                                deletedAt: new Date(),
                            },
                        ],
                    });

                    // Count with undefined where
                    const count1 = await db.count("user", {
                        where: undefined,
                    });
                    expect(count1).toBe(1);

                    // Count with empty object where
                    const count2 = await db.count("user", {
                        where: {},
                    });
                    expect(count2).toBe(1);

                    // Count with no options
                    const count3 = await db.count("user", {});
                    expect(count3).toBe(1);
                },
                { rollback: true },
            );
        });
    });
});
