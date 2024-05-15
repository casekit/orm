import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";

describe("findMany", () => {
    test("it can apply lateral clauses to queries with 1:N relations without creating duplicates", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                        {
                            username: "Eliza",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });
                const result = await db.findMany("post", {
                    select: ["title"],
                    include: {
                        author: {
                            select: ["username"],
                            include: {
                                posts: {
                                    select: ["title"],
                                    orderBy: ["title"],
                                },
                            },
                        },
                    },
                    orderBy: ["title"],
                });
                expect(result).toEqual([
                    {
                        title: "Post a",
                        author: {
                            username: "Russell",
                            posts: [
                                { title: "Post a" },
                                { title: "Post b" },
                                { title: "Post c" },
                            ],
                        },
                    },
                    {
                        title: "Post b",
                        author: {
                            username: "Russell",
                            posts: [
                                { title: "Post a" },
                                { title: "Post b" },
                                { title: "Post c" },
                            ],
                        },
                    },
                    {
                        title: "Post c",
                        author: {
                            username: "Russell",
                            posts: [
                                { title: "Post a" },
                                { title: "Post b" },
                                { title: "Post c" },
                            ],
                        },
                    },
                    {
                        title: "Post d",
                        author: {
                            username: "Eliza",
                            posts: [{ title: "Post d" }, { title: "Post e" }],
                        },
                    },
                    {
                        title: "Post e",
                        author: {
                            username: "Eliza",
                            posts: [{ title: "Post d" }, { title: "Post e" }],
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
