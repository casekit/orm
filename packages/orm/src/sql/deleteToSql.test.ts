import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";
import { unindent } from "@casekit/unindent";

import { deleteToSql } from "./deleteToSql.js";

describe("deleteToSql", () => {
    test("generates basic delete query", () => {
        const statement = deleteToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            where: sql`id = 1`,
            returning: [],
        });

        expect(statement.pretty).toBe(unindent`
            DELETE FROM "public"."users" AS "u"
            WHERE
                id = 1
       `);
        expect(statement.values).toEqual([]);
    });

    test("generates query with returning clause", () => {
        const statement = deleteToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            where: sql`id = 1`,
            returning: [
                { name: "id", alias: "u_0", path: ["id"] },
                { name: "name", alias: "u_1", path: ["name"] },
            ],
        });

        expect(statement.pretty).toBe(unindent`
            DELETE FROM "public"."users" AS "u"
            WHERE
                id = 1
            RETURNING
                "id" AS "u_0",
                "name" AS "u_1"
        `);
        expect(statement.values).toEqual([]);
    });

    test("handles complex where clause", () => {
        const statement = deleteToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            where: sql`id = ${1} AND email LIKE ${"@example.com"}`,
            returning: [],
        });
        expect(statement.pretty).toBe(unindent`
            DELETE FROM "public"."users" AS "u"
            WHERE
                id = $1
                AND email LIKE $2
        `);
        expect(statement.values).toEqual([1, "@example.com"]);
    });

    test("handles multiple returning columns", () => {
        const statement = deleteToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            where: sql`id = 1`,
            returning: [
                { name: "id", alias: "u_0", path: ["id"] },
                { name: "name", alias: "u_1", path: ["name"] },
                { name: "email", alias: "u_2", path: ["email"] },
            ],
        });
        expect(statement.pretty).toBe(unindent`
            DELETE FROM "public"."users" AS "u"
            WHERE
                id = 1
            RETURNING
                "id" AS "u_0",
                "name" AS "u_1",
                "email" AS "u_2"
        `);
        expect(statement.values).toEqual([]);
    });
});
