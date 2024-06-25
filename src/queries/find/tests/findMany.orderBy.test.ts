import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";
import { $in } from "../../clauses/where/operators";

describe("findMany", () => {
    test("it can return data in the specified order", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                    ],
                });
                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    orderBy: ["username"],
                });

                expect(results.map((r) => r.username)).toEqual([
                    "Dan",
                    "Fairooz",
                    "Russell",
                ]);
            },
            { rollback: true },
        );
    });

    test("it can return data in the reverse order", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                    ],
                });
                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    orderBy: [["username", "desc"]],
                });

                expect(results.map((r) => r.username)).toEqual([
                    "Russell",
                    "Fairooz",
                    "Dan",
                ]);
            },
            { rollback: true },
        );
    });

    test("it can return 1:N relations in order", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 3 }],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 2 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 6 }],
                        },
                    ],
                });
                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    include: {
                        posts: {
                            select: ["id", "title"],
                            orderBy: [["title", "desc"]],
                        },
                    },
                    orderBy: ["username"],
                });

                expect(
                    results.map((r) => [
                        r.username,
                        r.posts.map((p) => p.title),
                    ]),
                ).toEqual([
                    ["Dan", ["Post e", "Post d"]],
                    [
                        "Fairooz",
                        [
                            "Post k",
                            "Post j",
                            "Post i",
                            "Post h",
                            "Post g",
                            "Post f",
                        ],
                    ],
                    ["Russell", ["Post c", "Post b", "Post a"]],
                ]);
            },
            { rollback: true },
        );
    });

    test("it can return N:N relations in order", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [
                                { name: "WFMA", posts: 0 },
                                { name: "Popova Park", posts: 0 },
                                { name: "LRF", posts: 0 },
                            ],
                        },
                        {
                            username: "Dan",
                            tenants: [
                                { name: "Popova Park", posts: 0 },
                                { name: "LRF", posts: 0 },
                            ],
                        },
                        {
                            username: "Fairooz",
                            tenants: [
                                { name: "WFMA", posts: 0 },
                                { name: "LRF", posts: 0 },
                            ],
                        },
                    ],
                });
                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    include: {
                        tenants: {
                            select: ["id", "name"],
                            orderBy: ["name"],
                        },
                    },
                    orderBy: [["username", "desc"]],
                });

                expect(
                    results.map((r) => [
                        r.username,
                        r.tenants.map((t) => t.name),
                    ]),
                ).toEqual([
                    ["Russell", ["LRF", "Popova Park", "WFMA"]],
                    ["Fairooz", ["LRF", "WFMA"]],
                    ["Dan", ["LRF", "Popova Park"]],
                ]);
            },
            { rollback: true },
        );
    });
    test("it can order by fields on N:1 relations even if they're not included in the query", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 3 }],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 2 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 6 }],
                        },
                    ],
                });
                const results = await db.findMany("post", {
                    select: ["title"],
                    orderBy: [["author.username", "desc"], "title"],
                });

                // the extra joined table used for the ordering is not included in the result object
                expect(Object.keys(results[0])).toEqual(["title"]);

                expect(results.map((r) => r.title)).toEqual([
                    "Post a",
                    "Post b",
                    "Post c",
                    "Post f",
                    "Post g",
                    "Post h",
                    "Post i",
                    "Post j",
                    "Post k",
                    "Post d",
                    "Post e",
                ]);
            },
            { rollback: true },
        );
    });

    test("it can order by fields on N:1 relations that are included in the query without issue", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 3 }],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 2 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 6 }],
                        },
                    ],
                });
                const results = await db.findMany("post", {
                    select: ["title"],
                    include: {
                        author: {
                            select: ["id"],
                            where: { username: { [$in]: ["Russell", "Dan"] } },
                        },
                    },
                    orderBy: [["author.username", "desc"], "title"],
                });

                expect(results.map((r) => r.title)).toEqual([
                    "Post a",
                    "Post b",
                    "Post c",
                    "Post d",
                    "Post e",
                ]);
            },
            { rollback: true },
        );
    });
});
