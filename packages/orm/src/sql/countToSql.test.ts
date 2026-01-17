import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";
import { unindent } from "@casekit/unindent";

import { countToSql } from "./countToSql.js";

describe("countToSql", () => {
    test("generates basic count query", () => {
        const statement = countToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            joins: [],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                count(1) AS "count"
            FROM
                "public"."users" AS "a"
        `);
    });

    test("generates count query with where clause", () => {
        const statement = countToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            joins: [],
            where: sql`"a"."active" = ${true}`,
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
                SELECT
                    count(1) AS "count"
                FROM
                    "public"."users" AS "a"
                WHERE
                    "a"."active" = TRUE
            `);
    });

    test("generates count query with single join", () => {
        const statement = countToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "a",
                model: "post",
            },
            joins: [
                {
                    type: "INNER",
                    relation: "author",
                    table: {
                        schema: "public",
                        name: "users",
                        alias: "b",
                        model: "user",
                    },
                    columns: [
                        {
                            from: { table: "a", name: "author_id" },
                            to: { table: "b", name: "id" },
                        },
                    ],
                    path: ["author"],
                },
            ],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                count(1) AS "count"
            FROM
                "public"."posts" AS "a"
                JOIN "public"."users" AS "b" ON "a"."author_id" = "b"."id"
        `);
    });

    test("generates count query with multiple joins", () => {
        const statement = countToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "a",
                model: "post",
            },
            joins: [
                {
                    type: "INNER",
                    relation: "author",
                    table: {
                        schema: "public",
                        name: "users",
                        alias: "b",
                        model: "user",
                    },
                    columns: [
                        {
                            from: { table: "a", name: "author_id" },
                            to: { table: "b", name: "id" },
                        },
                    ],
                    path: ["author"],
                },
                {
                    type: "INNER",
                    relation: "category",
                    table: {
                        schema: "public",
                        name: "categories",
                        alias: "c",
                        model: "category",
                    },
                    columns: [
                        {
                            from: { table: "a", name: "category_id" },
                            to: { table: "c", name: "id" },
                        },
                    ],
                    path: ["category"],
                },
            ],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                count(1) AS "count"
            FROM
                "public"."posts" AS "a"
                JOIN "public"."users" AS "b" ON "a"."author_id" = "b"."id"
                JOIN "public"."categories" AS "c" ON "a"."category_id" = "c"."id"
        `);
    });

    test("generates count query with multiple joins and where clause", () => {
        const statement = countToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "a",
                model: "post",
            },
            joins: [
                {
                    type: "INNER",
                    relation: "author",
                    table: {
                        schema: "public",
                        name: "users",
                        alias: "b",
                        model: "user",
                    },
                    where: sql`"b"."id" = ${123}`,
                    columns: [
                        {
                            from: { table: "a", name: "author_id" },
                            to: { table: "b", name: "id" },
                        },
                    ],
                    path: ["author"],
                },
                {
                    type: "INNER",
                    relation: "category",
                    table: {
                        schema: "public",
                        name: "categories",
                        alias: "c",
                        model: "category",
                    },
                    columns: [
                        {
                            from: { table: "a", name: "category_id" },
                            to: { table: "c", name: "id" },
                        },
                    ],
                    path: ["category"],
                },
            ],
            where: sql`"a"."published" = ${true} AND "b"."active" = ${true}`,
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                count(1) AS "count"
            FROM
                "public"."posts" AS "a"
                JOIN "public"."users" AS "b" ON "a"."author_id" = "b"."id"
                AND "b"."id" = $1
                JOIN "public"."categories" AS "c" ON "a"."category_id" = "c"."id"
            WHERE
                "a"."published" = TRUE
                AND "b"."active" = TRUE
        `);
        expect(statement.values).toEqual([123]);
    });

    test("generates count query with FOR clause", () => {
        const statement = countToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            joins: [],
            for: "update",
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                count(1) AS "count"
            FROM
                "public"."users" AS "a"
        `);
    });
});
