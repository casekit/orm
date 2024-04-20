import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";

describe("findMany", () => {
    test("it can include N:1 -> 1:N relations", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [
                                { name: "WFMA", posts: 1 },
                                { name: "Popova Park", posts: 0 },
                            ],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 2 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                    ],
                });
                const results = await db.findMany("post", {
                    select: ["id", "title"],
                    include: {
                        author: {
                            select: ["id", "username"],
                            include: {
                                posts: { select: ["id", "title"] },
                            },
                        },
                    },
                    limit: 2,
                });

                expect(
                    results.map((p) => [
                        p.author.username,
                        p.author.posts.map((p) => p.title),
                    ]),
                ).toEqual([
                    ["Russell", ["Post a"]],
                    ["Dan", ["Post b", "Post c"]],
                ]);
            },
            { rollback: true },
        );
    });

    test("it can include N:1 -> N:N relations", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [
                                { name: "WFMA", posts: 1 },
                                { name: "Popova Park", posts: 0 },
                            ],
                        },
                        {
                            username: "Dan",
                            tenants: [{ name: "WFMA", posts: 2 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 0 }],
                        },
                    ],
                });
                const results = await db.findMany("post", {
                    select: ["id", "title"],
                    include: {
                        author: {
                            select: ["id", "username"],
                            include: {
                                tenants: {
                                    select: ["id", "name"],
                                    orderBy: ["name"],
                                },
                            },
                        },
                    },
                    limit: 2,
                });

                expect(
                    results.map((p) => [
                        p.author.username,
                        p.author.tenants.map((t) => t.name),
                    ]),
                ).toEqual([
                    ["Russell", ["Popova Park", "WFMA"]],
                    ["Dan", ["WFMA"]],
                ]);
            },
            { rollback: true },
        );
    });
});
