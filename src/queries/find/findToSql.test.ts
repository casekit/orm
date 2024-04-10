import { unindent } from "@casekit/unindent";

import * as uuid from "uuid";
import { describe, expect, test } from "vitest";

import { FindMany, db } from "../../test/db";
import { $and, $ilike, $lte } from "../where/operators";
import { buildFind } from "./buildFind";
import { findToSql } from "./findToSql";

describe("findToSql", () => {
    test("it builds a valid query for simple selects", async () => {
        const builder = buildFind(db.config, "post", {
            select: ["id", "title"],
        });
        const statement = findToSql(db.config, builder);
        expect(statement.text).toEqual(unindent`
            SELECT
                a.id AS a_0,
                a.title AS a_1
            FROM casekit.post a
            WHERE 1 = 1
        `);
    });

    test("it builds a valid query for included N:1 relations", async () => {
        const builder = buildFind(db.config, "post", {
            select: ["id", "title"],
            include: {
                author: { select: ["username"] },
            },
        } as FindMany<"post">);

        const statement = findToSql(db.config, builder);
        expect(statement.text).toEqual(unindent`
            SELECT
                a.id AS a_0,
                a.title AS a_1,
                b.username AS b_0,
                b.id AS b_1
            FROM casekit.post a
            JOIN casekit."user" b
                ON a.created_by_id = b.id
            WHERE 1 = 1
        `);
    });

    test("it builds a valid lateral query for 1:N relations", async () => {
        const builder = buildFind(db.config, "post", {
            select: ["id", "title"],
            include: {
                author: { select: ["username"] },
            },
            lateralBy: [{ column: "id", values: [uuid.v4()] }],
        } as FindMany<"post">);

        const statement = findToSql(db.config, builder);
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
            JOIN casekit."user" b
                ON a.created_by_id = b.id
            WHERE 1 = 1
                AND a.id = c.id
            ) d ON TRUE
        `);
    });

    test("it allows specifying where clauses on both the top level table and N:1 relations", async () => {
        const id1 = uuid.v4();
        const id2 = uuid.v4();
        const builder = buildFind(db.config, "post", {
            select: ["id", "title"],
            where: { title: { [$ilike]: "%cats%" } },
            include: {
                author: {
                    select: ["username"],
                    where: {
                        [$and]: [
                            { username: "Russell" },
                            { joinedAt: { [$lte]: new Date(2024, 6, 4) } },
                        ],
                    },
                },
            },
            lateralBy: [{ column: "id", values: [id1, id2] }],
        } as FindMany<"post">);

        const statement = findToSql(db.config, builder);
        expect(statement.text).toEqual(unindent`
            SELECT d.* FROM (
            SELECT UNNEST(ARRAY[$1, $2]::uuid[]) AS id) c
            JOIN LATERAL (
            SELECT
                a.id AS a_0,
                a.title AS a_1,
                b.username AS b_0,
                b.id AS b_1
            FROM casekit.post a
            JOIN casekit."user" b
                ON a.created_by_id = b.id
                AND (((b.username = $3) AND (b.created_at <= $4)))
            WHERE 1 = 1
                AND (a.title ILIKE $5)
                AND a.id = c.id
            ) d ON TRUE
        `);
        expect(statement.values).toEqual([
            id1,
            id2,
            "Russell",
            new Date(2024, 6, 4),
            "%cats%",
        ]);
    });
});
