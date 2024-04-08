import { describe, expect, test } from "vitest";

import { db } from "../test/db";
import * as factory from "../test/factory";

describe("findMany", () => {
    test("it can select fields from the model", async () => {
        await db.transact(
            async (db) => {
                const { post } = await factory.seed(db);
                const result = await db.findMany("post", {
                    select: ["id", "title"],
                });

                expect(result).toEqual([{ id: post.id, title: post.title }]);
            },
            { rollback: true },
        );
    });

    test("it retrieves records from the database", async () => {
        await db.transact(
            async (db) => {
                const { post, user } = await factory.seed(db);
                const result = await db.findMany("post", {
                    select: ["id", "title"],
                    include: { author: { select: ["id", "username"] } },
                });

                expect(result).toEqual([
                    {
                        id: post.id,
                        title: post.title,
                        author: {
                            id: user.id,
                            username: user.username,
                        },
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
