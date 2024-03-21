import { orm } from "@casekit/orm";

import { describe, expect, test } from "vitest";
import { createTableSql } from "~/migrate/createTableSql";
import { config, models } from "~/test/fixtures";

describe("create", () => {
    test("it inserts records into the database", async () => {
        await orm({ config, models }).transact(
            { rollback: true },
            async (db) => {
                await db.connection.query(createTableSql(db.models.post));
                const result = await db.create("post", {
                    data: {
                        id: "1",
                        title: "hello it me",
                        content: "i'm writing a post",
                    },
                });

                expect(result).toEqual(true);

                const rows = await db.findMany("post", {
                    select: ["id", "title"],
                });

                expect(rows).toHaveLength(1);
                expect(rows[0]).toEqual({
                    id: "1",
                    title: "hello it me",
                });
            },
        );
    });
});
