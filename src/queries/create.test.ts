import { orm } from "@casekit/orm";

import * as uuid from "uuid";
import { describe, expect, test } from "vitest";
import { config, models } from "~/test/fixtures";

describe("create", () => {
    test.only("it inserts records into the database", async () => {
        await orm({ config, models }).transact(
            async (db) => {
                const id = uuid.v4();
                const result = await db.create("post", {
                    data: {
                        id: id,
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
                    id: id,
                    title: "hello it me",
                });
            },
            { rollback: true },
        );
    });
});
