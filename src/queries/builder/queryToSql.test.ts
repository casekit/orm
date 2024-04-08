import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { FindMany, db } from "../../test/db";
import { buildQuery } from "./buildQuery";
import { queryToSql } from "./queryToSql";

describe("queryToSql", () => {
    test("it builds a valid query for simple selects", async () => {
        const builder = buildQuery(db.config, "post", {
            select: ["id", "title"],
        });
        const statement = queryToSql(builder);
        expect(statement.text).toEqual(unindent`
            SELECT
                a.id AS a_0,
                a.title AS a_1
            FROM casekit.post a
        `);
    });
    test("it builds a valid query for included N:1 relations", async () => {
        const builder = buildQuery(db.config, "post", {
            select: ["id", "title"],
            include: {
                author: { select: ["username"] },
            },
        } as FindMany<"post">);

        const statement = queryToSql(builder);
        expect(statement.text).toEqual(unindent`
            SELECT
                a.id AS a_0,
                a.title AS a_1,
                b.username AS b_0,
                b.id AS b_1
            FROM casekit.post a
            JOIN casekit."user" b ON a.created_by_id = b.id
        `);
    });
});
