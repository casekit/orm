import { unindent } from "@casekit/unindent";

import * as uuid from "uuid";
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
            WHERE 1 = 1
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
            WHERE 1 = 1
        `);
    });

    test("it builds a valid lateral query for 1:N relations", async () => {
        const builder = buildQuery(db.config, "post", {
            select: ["id", "title"],
            include: {
                author: { select: ["username"] },
            },
            lateralBy: [{ column: "id", values: [uuid.v4()] }],
        } as FindMany<"post">);

        const statement = queryToSql(builder);
        expect(statement.text).toEqual(unindent`
            SELECT c.* FROM (
            SELECT UNNEST(ARRAY[$1]::uuid[]) AS id) b
            JOIN LATERAL (
            SELECT
                a.id AS a_0,
                a.title AS a_1,
                d.username AS d_0,
                d.id AS d_1
            FROM casekit.post a
            JOIN casekit."user" d ON a.created_by_id = d.id
            WHERE 1 = 1
                AND a.id = b.id
            ) c ON TRUE
        `);
    });
});
