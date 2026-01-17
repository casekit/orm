import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { $not } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("findOne: N:1 relations", () => {
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

    test("can select N:1 relations", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, name: "Author 1" }),
                        factory.user({ id: 2, name: "Author 2" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 3,
                            title: "Post 1",
                            authorId: 1,
                        }),
                        factory.post({
                            id: 4,
                            title: "Post 2",
                            authorId: 2,
                        }),
                    ],
                });

                const post = await db.findOne("post", {
                    select: ["id", "title"],
                    where: { id: 3 },
                    include: {
                        author: {
                            select: ["id", "name"],
                        },
                    },
                });

                expect(post).toEqual({
                    id: 3,
                    title: "Post 1",
                    author: { id: 1, name: "Author 1" },
                });
            },
            { rollback: true },
        );
    });

    test("can select nested N:1 relations", async () => {
        await db.transact(
            async (db) => {
                await db.createOne("color", {
                    values: factory.color({ hex: "#ff0000", name: "Red" }),
                });

                const user = await db.createOne("user", {
                    values: factory.user({ id: 1, name: "Author" }),
                });

                await db.createOne("post", {
                    values: factory.post({
                        id: 2,
                        title: "Post 2",
                        authorId: 1,
                        backgroundColorValue: "#ff0000",
                    }),
                });

                const post = await db.findOne("post", {
                    select: ["id"],
                    include: {
                        author: {
                            select: ["name"],
                            include: {
                                posts: {
                                    select: ["id", "title"],
                                    include: {
                                        backgroundColor: {
                                            select: ["name"],
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                expect(post).toEqual({
                    id: 2,
                    author: {
                        name: "Author",
                        posts: [
                            {
                                id: 2,
                                title: "Post 2",
                                backgroundColor: { name: "Red" },
                            },
                        ],
                    },
                });
            },
            { rollback: true },
        );
    });

    test("filters by N:1 relation where clause", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("user", {
                    values: [
                        factory.user({
                            id: 1,
                            name: "Active",
                            deletedAt: null,
                        }),
                        factory.user({
                            id: 2,
                            name: "Deleted",
                            deletedAt: new Date(),
                        }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                        }),
                        factory.post({
                            id: 2,
                            authorId: 2,
                        }),
                    ],
                });

                const post = await db.findOne("post", {
                    select: ["id"],
                    where: { id: 1 },
                    include: {
                        author: {
                            select: ["name"],
                            where: { deletedAt: null },
                        },
                    },
                });

                expect(post).toEqual({ id: 1, author: { name: "Active" } });

                // Test that filtering works - this post's author doesn't match the where clause
                await expect(async () => {
                    await db.findOne("post", {
                        select: ["id"],
                        where: { id: 2 },
                        include: {
                            author: {
                                select: ["name"],
                                where: { deletedAt: null },
                            },
                        },
                    });
                }).rejects.toThrow();
            },
            { rollback: true },
        );
    });

    test("enforces where clause even on optional N:1 relation", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#ff0000", name: "Red" }),
                        factory.color({ hex: "#0000ff", name: "Blue" }),
                    ],
                });

                await db.createOne("user", {
                    values: factory.user({ id: 1 }),
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                        }),
                        factory.post({
                            id: 3,
                            authorId: 1,
                            backgroundColorValue: "#0000ff",
                        }),
                    ],
                });

                const post = await db.findOne("post", {
                    select: ["id"],
                    where: { id: 3 },
                    include: {
                        backgroundColor: {
                            select: ["name"],
                            where: { name: "Blue" },
                        },
                    },
                });

                expect(post).toEqual({
                    id: 3,
                    backgroundColor: {
                        name: "Blue",
                    },
                });

                // Test that post without backgroundColor matching the filter will exclude the record
                await expect(
                    db.findOne("post", {
                        select: ["id"],
                        where: { id: 1 },
                        include: {
                            backgroundColor: {
                                select: ["name"],
                                where: { name: "Blue" },
                            },
                        },
                    }),
                ).rejects.toThrowError("Expected one row, but found none");
            },
            { rollback: true },
        );
    });

    test("combines where clauses across multiple levels", async () => {
        await db.transact(
            async (db) => {
                await db.createMany("color", {
                    values: [
                        factory.color({ hex: "#ff0000", name: "Red" }),
                        factory.color({ hex: "#0000ff", name: "Blue" }),
                    ],
                });

                await db.createMany("user", {
                    values: [
                        factory.user({ id: 1, role: "admin" }),
                        factory.user({ id: 2, role: "user" }),
                    ],
                });

                await db.createMany("post", {
                    values: [
                        factory.post({
                            id: 1,
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                            publishedAt: new Date(),
                        }),
                        factory.post({
                            id: 2,
                            authorId: 1,
                            backgroundColorValue: "#ff0000",
                            publishedAt: null,
                        }),
                        factory.post({
                            id: 3,
                            authorId: 2,
                            backgroundColorValue: "#ff0000",
                            publishedAt: new Date(),
                        }),
                        factory.post({
                            id: 4,
                            authorId: 1,
                            backgroundColorValue: "#0000ff",
                            publishedAt: new Date(),
                        }),
                    ],
                });

                const post = await db.findOne("post", {
                    select: ["id"],
                    where: {
                        id: 1,
                        publishedAt: { [$not]: null },
                    },
                    include: {
                        author: {
                            select: ["id"],
                            where: { role: "admin" },
                        },
                        backgroundColor: {
                            select: ["name"],
                            where: { name: "Red" },
                        },
                    },
                });

                expect(post).toEqual({
                    id: 1,
                    author: { id: 1 },
                    backgroundColor: { name: "Red" },
                });
            },
            { rollback: true },
        );
    });

    test("handles optional N:1 relation with nested non-optional relation using subquery", async () => {
        await db.transact(
            async (db) => {
                // Create departments
                await db.createOne("department", {
                    values: factory.department({
                        id: 1,
                        name: "Engineering",
                    }),
                });

                await db.createOne("department", {
                    values: factory.department({
                        id: 2,
                        name: "Sales",
                    }),
                });

                // Create employees
                await db.createOne("employee", {
                    values: factory.employee({
                        id: 1,
                        name: "Alice",
                        departmentId: 1,
                    }),
                });

                await db.createOne("employee", {
                    values: factory.employee({
                        id: 2,
                        name: "Bob",
                        departmentId: 2,
                    }),
                });

                // Create tasks - some with assignees, some without
                await db.createMany("task", {
                    values: [
                        factory.task({
                            id: 1,
                            title: "Task with Alice",
                            assigneeId: 1,
                        }),
                        factory.task({
                            id: 2,
                            title: "Unassigned task",
                            assigneeId: null,
                        }),
                        factory.task({
                            id: 3,
                            title: "Task with Bob",
                            assigneeId: 2,
                        }),
                    ],
                });

                // Test 1: Task with assignee and department
                const taskWithAssignee = await db.findOne("task", {
                    select: ["id", "title"],
                    where: { id: 1 },
                    include: {
                        assignee: {
                            select: ["name"],
                            include: {
                                department: {
                                    select: ["name"],
                                },
                            },
                        },
                    },
                });

                expect(taskWithAssignee).toEqual({
                    id: 1,
                    title: "Task with Alice",
                    assignee: {
                        name: "Alice",
                        department: {
                            name: "Engineering",
                        },
                    },
                });

                // Test 2: Task without assignee should return with null assignee
                // This is the critical test - the LEFT JOIN with nested INNER JOIN
                // should be wrapped in a subquery to preserve the NULL behavior
                const unassignedTask = await db.findOne("task", {
                    select: ["id", "title"],
                    where: { id: 2 },
                    include: {
                        assignee: {
                            select: ["name"],
                            include: {
                                department: {
                                    select: ["name"],
                                },
                            },
                        },
                    },
                });

                expect(unassignedTask).toEqual({
                    id: 2,
                    title: "Unassigned task",
                    assignee: null,
                });

                // Test 3: Verify Bob's task also works correctly
                const bobsTask = await db.findOne("task", {
                    select: ["id", "title"],
                    where: { id: 3 },
                    include: {
                        assignee: {
                            select: ["name"],
                            include: {
                                department: {
                                    select: ["name"],
                                },
                            },
                        },
                    },
                });

                expect(bobsTask).toEqual({
                    id: 3,
                    title: "Task with Bob",
                    assignee: {
                        name: "Bob",
                        department: {
                            name: "Sales",
                        },
                    },
                });
            },
            { rollback: true },
        );
    });

    test("handles where clauses on nested relations of optional N:1 relations", async () => {
        await db.transact(
            async (db) => {
                // Create departments
                const engineering = await db.createOne("department", {
                    values: factory.department({
                        id: 1,
                        name: "Engineering",
                    }),
                    returning: ["id", "name"],
                });

                const sales = await db.createOne("department", {
                    values: factory.department({
                        id: 2,
                        name: "Sales",
                    }),
                    returning: ["id", "name"],
                });

                // Create employees in different departments
                const alice = await db.createOne("employee", {
                    values: factory.employee({
                        id: 1,
                        name: "Alice",
                        departmentId: 1,
                    }),
                    returning: ["id", "name"],
                });

                const bob = await db.createOne("employee", {
                    values: factory.employee({
                        id: 2,
                        name: "Bob",
                        departmentId: 2,
                    }),
                    returning: ["id", "name"],
                });

                // Create tasks
                const [task1, task2, task3] = await db.createMany("task", {
                    values: [
                        factory.task({
                            id: 1,
                            title: "Engineering task",
                            assigneeId: alice.id,
                        }),
                        factory.task({
                            id: 2,
                            title: "Sales task",
                            assigneeId: bob.id,
                        }),
                        factory.task({
                            id: 3,
                            title: "Unassigned task",
                            assigneeId: null,
                        }),
                    ],
                    returning: ["id", "title"],
                });

                // Test 1: optional N:1 relation (assignee) includes non-optional department
                const engineeringTasks = await db.findMany("task", {
                    select: ["id", "title"],
                    include: {
                        assignee: {
                            select: ["id", "name"],
                            include: {
                                department: {
                                    select: ["id", "name"],
                                    where: { name: "Engineering" },
                                },
                            },
                        },
                    },
                    orderBy: ["id"],
                });

                // All tasks are returned (because assignee is optional)
                // Only assignees in Engineering dept are returned
                // Task 3 is filtered out (no assignee)
                expect(engineeringTasks).toEqual([
                    {
                        ...task1,
                        assignee: {
                            ...alice,
                            department: { ...engineering },
                        },
                    },
                    { ...task2, assignee: null },
                    { ...task3, assignee: null },
                ]);

                // Test 2: Where clause on the assignee itself (not nested department)
                const aliceTasks = await db.findMany("task", {
                    select: ["id", "title"],
                    include: {
                        assignee: {
                            select: ["id", "name"],
                            where: { name: "Alice" },
                            include: {
                                department: {
                                    select: ["id", "name"],
                                },
                            },
                        },
                    },
                    orderBy: ["id"],
                });

                // Only task 1 should be returned (assigned to Alice)
                expect(aliceTasks).toEqual([
                    {
                        ...task1,
                        assignee: {
                            ...alice,
                            department: { ...engineering },
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
