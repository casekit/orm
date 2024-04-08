import { unindent } from "@casekit/unindent";

import * as uuid from "uuid";
import { describe, expect, test } from "vitest";

import { FindMany, db } from "../../test/db";
import { buildFindMany } from "./buildFindMany";
import { findManyToSql } from "./findManyToSql";

describe("findManyToSql", () => {
    test("it builds a valid query for simple selects", async () => {
        const builder = buildFindMany(db.config, "post", {
            select: ["id", "title"],
        });
        const statement = findManyToSql(builder);
        expect(statement.text).toEqual(unindent`
            SELECT
                a.id AS a_0,
                a.title AS a_1
            FROM casekit.post a
            WHERE 1 = 1
        `);
    });

    test("it builds a valid query for included N:1 relations", async () => {
        const builder = buildFindMany(db.config, "post", {
            select: ["id", "title"],
            include: {
                author: { select: ["username"] },
            },
        } as FindMany<"post">);

        const statement = findManyToSql(builder);
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
        const builder = buildFindMany(db.config, "post", {
            select: ["id", "title"],
            include: {
                author: { select: ["username"] },
            },
            lateralBy: [{ column: "id", values: [uuid.v4()] }],
        } as FindMany<"post">);

        const statement = findManyToSql(builder);
        expect(statement.text).toEqual(unindent`
            SELECT d.* FROM (
            SELECT UNNEST(ARRAY[$1]::uuid[]) AS id) c
            JOIN LATERAL (
            SELECT
                a.id AS a_0,
                a.title AS a_1,
                b.username AS b_0,
                b.id AS b_1
            FROM casekit.post a
            JOIN casekit."user" b ON a.created_by_id = b.id
            WHERE 1 = 1
                AND a.id = c.id
            ) d ON TRUE
        `);
    });
});
