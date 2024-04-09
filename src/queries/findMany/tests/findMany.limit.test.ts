import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";

describe("findMany", () => {
    test("it can limit the number of rows returned", async () => {
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
                    limit: 2,
                });

                expect(results.map((r) => r.username)).toEqual([
                    "Dan",
                    "Fairooz",
                ]);
            },
            { rollback: true },
        );
    });

    test("offsets can be applied", async () => {
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
                    limit: 1,
                    offset: 2,
                });

                expect(results.map((r) => r.username)).toEqual(["Russell"]);
            },
            { rollback: true },
        );
    });

    test("1:N relations can have limits and offsets applied", async () => {
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
                            tenants: [{ name: "WFMA", posts: 5 }],
                        },
                        {
                            username: "Fairooz",
                            tenants: [{ name: "WFMA", posts: 2 }],
                        },
                    ],
                });
                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    orderBy: ["username"],
                    include: {
                        posts: {
                            select: ["title"],
                            orderBy: ["title"],
                            limit: 2,
                            offset: 1,
                        },
                    },
                });

                expect(
                    results.map((r) => [
                        r.username,
                        r.posts.map((p) => p.title),
                    ]),
                ).toEqual([
                    ["Dan", ["Post e", "Post f"]],
                    ["Fairooz", ["Post j"]],
                    ["Russell", ["Post b", "Post c"]],
                ]);
            },
            { rollback: true },
        );
    });

    test("N:N relations can have limits and offsets applied", async () => {
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
                    orderBy: ["username"],
                    include: {
                        tenants: {
                            select: ["name"],
                            orderBy: ["name"],
                            limit: 2,
                            offset: 1,
                        },
                    },
                });

                expect(
                    results.map((r) => [
                        r.username,
                        r.tenants.map((p) => p.name),
                    ]),
                ).toEqual([
                    ["Dan", ["Popova Park"]],
                    ["Fairooz", ["WFMA"]],
                    ["Russell", ["Popova Park", "WFMA"]],
                ]);
            },
            { rollback: true },
        );
    });
});
