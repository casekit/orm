import { describe, expect, test } from "vitest";

import { db } from "../../../test/db";
import { seed } from "../../../test/seed";

describe("count", () => {
    test("it counts the number of rows a query would return", async () => {
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Russell",
                            tenants: [{ name: "WFMA", posts: 3 }],
                        },
                        {
                            username: "Stewart Home",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });
                const result = await db.count("post", {
                    include: {
                        author: {
                            where: { username: "Stewart Home" },
                        },
                    },
                });

                expect(result).toBe(2);
            },
            { rollback: true },
        );
    });
});
