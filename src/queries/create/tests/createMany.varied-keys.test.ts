import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";

describe("createMany", () => {
    test("it can handle varied combinations of optional keys in its values", async () => {
        await db.transact(
            async (db) => {
                const russell = await db.createOne("user", {
                    values: { username: `Russell` },
                    returning: ["id", "username"],
                });
                const others = await db.createMany("user", {
                    values: [
                        { username: "Fairooz" },
                        { username: "Dan", invitedById: russell.id },
                    ],
                    returning: ["username", "invitedById"],
                });
                expect(others).toEqual([
                    { username: "Fairooz", invitedById: null },
                    { username: "Dan", invitedById: russell.id },
                ]);
            },
            { rollback: true },
        );
    });
});
