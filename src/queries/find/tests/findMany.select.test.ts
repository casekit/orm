import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";

describe("findMany", () => {
    test("it can select fields from the model", async () => {
        await db.transact(
            async (db) => {
                const { posts } = await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 1 }],
                        },
                    ],
                });
                const results = await db.findMany("post", {
                    select: ["id", "title"],
                });

                expect(results.find((r) => r.id === posts[0].id)).toEqual({
                    id: posts[0].id,
                    title: posts[0].title,
                });
            },
            { rollback: true },
        );
    });

    test("it can select fields from N:1 relations", async () => {
        await db.transact(
            async (db) => {
                const { posts, users } = await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 1 }],
                        },
                    ],
                });
                const results = await db.findMany("post", {
                    select: ["id", "title"],
                    include: { author: { select: ["id", "username"] } },
                });

                expect(results.find((r) => r.id === posts[0].id)).toEqual({
                    id: posts[0].id,
                    title: posts[0].title,
                    author: {
                        id: users["Russell"].id,
                        username: users["Russell"].username,
                    },
                });
            },
            { rollback: true },
        );
    });

    test("it can select fields from 1:N relations", async () => {
        await db.transact(
            async (db) => {
                const { posts, users } = await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [
                                { name: "WFMA", posts: 1 },
                                { name: "Popova Park", posts: 1 },
                            ],
                        },
                    ],
                });
                const user = users["Russell"];

                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    include: {
                        posts: {
                            select: ["id", "title", "content"],
                            orderBy: ["title"],
                        },
                    },
                });

                expect(results.find((r) => r.id === user.id)).toEqual({
                    id: user.id,
                    username: user.username,
                    posts: [
                        {
                            id: posts[0].id,
                            title: posts[0].title,
                            content: posts[0].content,
                        },
                        {
                            id: posts[1].id,
                            title: posts[1].title,
                            content: posts[1].content,
                        },
                    ],
                });
            },
            { rollback: true },
        );
    });

    test("it can select fields from N:N relations", async () => {
        await db.transact(
            async (db) => {
                const { tenants, users } = await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [
                                { name: "Popova Park", posts: 0 },
                                { name: "WFMA", posts: 0 },
                            ],
                        },
                    ],
                });
                const user = users["Russell"];
                const result = await db.findMany("user", {
                    select: ["id", "username"],
                    include: {
                        tenants: { select: ["id", "name"], orderBy: ["name"] },
                    },
                });

                expect(result).toEqual([
                    {
                        id: user.id,
                        username: user.username,
                        tenants: [
                            {
                                id: tenants["Popova Park"].id,
                                name: tenants["Popova Park"].name,
                            },
                            {
                                id: tenants["WFMA"].id,
                                name: tenants["WFMA"].name,
                            },
                        ],
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("primary keys are not returned unless specified in the select clause", async () => {
        await db.transact(
            async (db) => {
                const { tenants, users } = await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [
                                { name: "Popova Park", posts: 0 },
                                { name: "WFMA", posts: 0 },
                            ],
                        },
                    ],
                });
                const user = users["Russell"];
                const wfma = tenants["WFMA"];
                const popovapark = tenants["Popova Park"];

                const result = await db.findMany("user", {
                    select: ["username"],
                    include: {
                        tenants: { select: ["name"], orderBy: ["name"] },
                    },
                });

                expect(result).toEqual([
                    {
                        username: user.username,
                        tenants: [
                            { name: popovapark.name },
                            { name: wfma.name },
                        ],
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
