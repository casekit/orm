import { unindent } from "@casekit/unindent";

import { beforeEach, describe, expect, test } from "vitest";
import { db } from "~/test/fixtures";
import { withRollback } from "~/test/util/withRollback";
import { withTransaction } from "~/test/util/withTransaction";

import { createTableSql } from "./createTableSql";

describe("createTableSql", () => {
    test("it generates a CREATE TABLE command", () => {
        expect(createTableSql(db.models.post)).toEqual(unindent`
            CREATE TABLE casekit.post (
                id uuid NOT NULL,
                title text NOT NULL,
                content text NOT NULL,
                published_at timestamp,
                PRIMARY KEY (id)
            );
        `);
    });

    beforeEach(async () => {
        await withTransaction(async (client) => {
            await client.query("DROP TABLE IF EXISTS casekit.post");
        });
    });

    test("the generated DDL successfully creates a table", async () => {
        const sql = createTableSql(db.models.post);
        await withRollback(async (client) => {
            await client.query(sql);
            const result = await client.query("select * from casekit.post");
            expect(result.fields.map((f) => f.name)).toEqual([
                "id",
                "title",
                "content",
                "published_at",
            ]);
        });
    });
});
