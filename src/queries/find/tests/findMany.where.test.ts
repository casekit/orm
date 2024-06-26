import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";
import { $in } from "../../clauses/where/operators";

describe("findMany", () => {
    test("it can apply where clauses to queries", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "Popova Park", posts: 6 }],
                        },
                    ],
                });
                const result = await db.findMany("post", {
                    select: ["title"],
                    where: { title: { [$in]: ["Post a", "Post c"] } },
                    orderBy: ["title"],
                });
                expect(result).toEqual([
                    { title: "Post a" },
                    { title: "Post c" },
                ]);
            },
            { rollback: true },
        );
    });

    test("clauses applied to N:1 models apply to the whole query", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });
                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        include: {
                            author: {
                                select: ["username"],
                                where: { username: "Fairooz" },
                            },
                        },
                        orderBy: ["title"],
                    }),
                ).toEqual([]);

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        include: {
                            author: {
                                select: ["username"],
                                where: { username: "Russell" },
                            },
                        },
                        orderBy: ["title"],
                    }),
                ).toEqual([
                    { title: "Post a", author: { username: "Russell" } },
                    { title: "Post b", author: { username: "Russell" } },
                ]);
            },
            { rollback: true },
        );
    });
});
