import { describe, expect, test } from "vitest";

import { db } from "./test/db";
import { seed } from "./test/seed";

describe("orm.query", () => {
    test("allows arbitrary sql queries to be run against the database", async () => {
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

                const result = await db.query<{ total: number }>`
                    select count(1)::int as total from casekit.post;
                `;

                expect(result[0]).toEqual({ total: 6 });
            },
            { rollback: true },
        );
    });
});
