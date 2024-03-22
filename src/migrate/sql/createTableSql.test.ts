import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";
import { db } from "~/test/fixtures";
import { withRollback } from "~/test/util/withRollback";

import { createTableSql } from "./createTableSql";

describe("createTableSql", () => {
    test("it generates a CREATE TABLE command", () => {
        expect(createTableSql(db.models.user).toQuery()).toEqual([
            unindent`
            CREATE TABLE casekit."user" (
                id uuid NOT NULL,
                username text NOT NULL UNIQUE,
                joined_at timestamp,
                PRIMARY KEY (id)
            );
            `,
            [],
        ]);
    });

    test.only("the generated DDL successfully creates a table", async () => {
        await withRollback(async (client) => {
            await client.query(
                ...createTableSql({
                    ...db.models.post,
                    table: "post_for_test",
                }).toQuery(),
            );
            const result = await client.query(
                "select * from casekit.post_for_test",
            );
            expect(result.fields.map((f) => f.name)).toEqual([
                "id",
                "title",
                "content",
                "published_at",
            ]);
        });
    });
});
