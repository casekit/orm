import { describe, expect, test } from "vitest";

import { OrmError } from "../../../errors";
import { db } from "../../../test/db";
import { seed } from "../../../test/seed";
import { $like } from "../../clauses/where/operators";

describe("updateOne", () => {
    test("it updates a single record in the database", async () => {
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Stewart House",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                    ],
                });

                const user = users["Stewart House"];

                const updated = await db.updateOne("user", {
                    set: { username: "Stewart Home" },
                    where: { username: "Stewart House" },
                    returning: ["id", "username"],
                });

                expect(updated.id).toEqual(user.id);
                expect(updated.username).toEqual("Stewart Home");

                const results = await db.findMany("user", {
                    select: ["id", "username"],
                    where: { username: { [$like]: "Stewart %" } },
                });

                expect(results).toEqual([updated]);
            },
            { rollback: true },
        );
    });

    test("if no records are updated, it throws an error and rolls back to before the update", async () => {
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Stewart House",
                            tenants: [{ name: "Popova Park", posts: 3 }],
                        },
                    ],
                });

                const user = users["Stewart House"];

                await expect(
                    db.updateOne("user", {
                        set: { username: "Stewart Home" },
                        where: { username: "Stewart Wrong" },
                        returning: ["id", "username"],
                    }),
                ).rejects.toEqual(new OrmError("No rows updated"));

                const result = await db.findOne("user", {
                    select: ["id", "username"],
                    where: { username: "Stewart House" },
                });

                expect(result).toEqual(user);
            },
            { rollback: true },
        );
    });

    test("if multiple records are updated, it throws an error and rolls back to before the update", async () => {
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
                    db.updateOne("user", {
                        set: { joinedAt: new Date("2021-01-04") },
                        where: { username: { [$like]: "Stewart %" } },
                        returning: ["id", "username"],
                    }),
                ).rejects.toEqual(
                    new OrmError(
                        "More than one updated row for updateOne, rolling back",
                    ),
                );

                const result = await db.findMany("user", {
                    select: ["id", "username", "joinedAt"],
                    where: { username: { [$like]: "Stewart %" } },
                    orderBy: ["username"],
                });

                expect(result.map((u) => u.joinedAt)).not.toEqual([
                    new Date("2021-01-04"),
                    new Date("2021-01-04"),
                ]);
            },
            { rollback: true },
        );
    });
});
