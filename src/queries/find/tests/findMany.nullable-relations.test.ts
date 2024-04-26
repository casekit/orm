import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";

describe("findMany", () => {
    test("optional N:1 relations don't prevent records being returned", async () => {
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
                        reviewedBy: {
                            select: ["id", "username"],
                            include: {
                                posts: { select: ["id", "title"] },
                                invitedBy: { select: ["id", "username"] },
                            },
                        },
                    },
                    orderBy: ["title"],
                    limit: 2,
                });

                expect(results.map((p) => [p.title, p.reviewedBy])).toEqual([
                    ["Post a", null],
                    ["Post b", null],
                ]);
            },
            { rollback: true },
        );
    });

    test("optional N:1 relations are returned if they exist", async () => {
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
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
                await db.updateOne("user", {
                    where: { id: users["Dan"].id },
                    set: {
                        invitedById: users["Russell"].id,
                    },
                });
                const results = await db.findMany("user", {
                    select: ["username"],
                    include: {
                        invitedBy: {
                            select: ["username"],
                        },
                        tenants: {
                            select: ["name"],
                            orderBy: ["name"],
                        },
                        reviewedPosts: {
                            select: ["title"],
                        },
                        invitedUsers: {
                            select: ["username"],
                        },
                    },
                    orderBy: ["username"],
                });
                expect(results).toEqual([
                    {
                        username: "Dan",
                        invitedBy: { username: "Russell" },
                        tenants: [{ name: "WFMA" }],
                        reviewedPosts: [],
                        invitedUsers: [],
                    },
                    {
                        username: "Fairooz",
                        invitedBy: null,
                        tenants: [{ name: "WFMA" }],
                        reviewedPosts: [],
                        invitedUsers: [],
                    },
                    {
                        username: "Russell",
                        invitedBy: null,
                        tenants: [{ name: "Popova Park" }, { name: "WFMA" }],
                        reviewedPosts: [],
                        invitedUsers: [{ username: "Dan" }],
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
