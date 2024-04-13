import { describe, expect, test } from "vitest";

import { OrmError } from "../../../errors";
import { db } from "../../../test/db";
import { seed } from "../../../test/seed";
import { $like } from "../../clauses/where/operators";

describe("deleteOne", () => {
    test("it deletes a single record in the database", async () => {
        await db.transact(
            async (db) => {
                const { posts } = await seed(db, {
                    users: [
                        {
                            username: "Stewart House",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                    ],
                });

                const deleted = await db.deleteOne("post", {
                    where: { title: "Post a" },
                    returning: ["id"],
                });

                expect(deleted.id).toEqual(
                    posts.find((p) => p.title === "Post a")?.id,
                );

                const results = await db.findMany("post", {
                    select: ["id", "title"],
                    include: {
                        author: {
                            select: ["id", "username"],
                            where: { username: { [$like]: "Stewart %" } },
                        },
                    },
                });

                expect(results.map((p) => p.title)).toEqual([
                    "Post b",
                    "Post c",
                ]);
            },
            { rollback: true },
        );
    });

    test("if no records are deleted, it throws an error and rolls back to before the delete", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Stewart House",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                    ],
                });

                await expect(
                    db.deleteOne("post", {
                        where: { title: "Wrong" },
                        returning: ["id"],
                    }),
                ).rejects.toEqual(new OrmError("No rows deleted"));
            },
            { rollback: true },
        );
    });

    test.only("if multiple records are deleted, it throws an error and rolls back to before the delete", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Stewart House",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                        {
                            username: "Stewart Home",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                    ],
                });

                await expect(
                    db.deleteOne("post", {
                        where: { title: { [$like]: "Post%" } },
                        returning: ["id"],
                    }),
                ).rejects.toEqual(
                    new OrmError(
                        "More than one deleted row for deleteOne, rolling back",
                    ),
                );

                const result = await db.findMany("post", {
                    select: ["id"],
                });

                expect(result.length).toEqual(6);
            },
            { rollback: true },
        );
    });
});
