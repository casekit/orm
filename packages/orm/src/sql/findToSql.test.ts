import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";
import { unindent } from "@casekit/unindent";

import { findToSql } from "./findToSql.js";

describe("findToSql", () => {
    test("generates basic select query", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [
                { table: "a", name: "id", alias: "a_0", path: ["id"] },
                { table: "a", name: "name", alias: "a_1", path: ["name"] },
            ],
            joins: [],
            orderBy: [],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "a"."id" AS "a_0",
                "a"."name" AS "a_1"
            FROM
                "public"."users" AS "a"
        `);
    });

    test("generates query with joins", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "a",
                model: "post",
            },
            columns: [
                { table: "a", name: "id", alias: "a_0", path: ["id"] },
                {
                    table: "b",
                    name: "name",
                    alias: "b_0",
                    path: ["author", "name"],
                },
            ],
            joins: [
                {
                    type: "LEFT",
                    path: ["author"],
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
                    where: sql`"b"."deleted_at" IS NULL`,
                },
            ],
            orderBy: [],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "a"."id" AS "a_0",
                "b"."name" AS "b_0"
            FROM
                "public"."posts" AS "a"
                LEFT JOIN "public"."users" AS "b" ON "a"."author_id" = "b"."id"
                AND "b"."deleted_at" IS NULL
        `);
    });

    test("generates query with compound key join", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [
                { table: "a", name: "id", alias: "a_0", path: ["id"] },
                {
                    table: "b",
                    name: "name",
                    alias: "b_0",
                    path: ["organization", "name"],
                },
            ],
            joins: [
                {
                    path: ["organization"],
                    type: "LEFT",
                    relation: "organization",
                    table: {
                        schema: "public",
                        name: "organisatations",
                        alias: "b",
                        model: "organization",
                    },
                    columns: [
                        {
                            from: { table: "a", name: "org_id" },
                            to: { table: "b", name: "id" },
                        },
                        {
                            from: { table: "a", name: "org_type" },
                            to: { table: "b", name: "type" },
                        },
                    ],
                },
            ],
            orderBy: [],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "a"."id" AS "a_0",
                "b"."name" AS "b_0"
            FROM
                "public"."users" AS "a"
                LEFT JOIN "public"."organisatations" AS "b" ON "a"."org_id" = "b"."id"
                AND "a"."org_type" = "b"."type"
        `);
    });

    test("generates query with order by", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [{ table: "a", name: "id", alias: "a_0", path: ["id"] }],
            joins: [],
            orderBy: [
                {
                    column: {
                        table: "a",
                        name: "id",
                    },
                    direction: "ASC",
                },
            ],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "a"."id" AS "a_0"
            FROM
                "public"."users" AS "a"
            ORDER BY
                "a"."id" ASC
        `);
    });

    test("generates query with limit and offset", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [{ table: "a", name: "id", alias: "a_0", path: ["id"] }],
            joins: [],
            orderBy: [],
            limit: 10,
            offset: 20,
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "a"."id" AS "a_0"
            FROM
                "public"."users" AS "a"
            LIMIT
                $1
            OFFSET
                $2
        `);
    });

    test("generates basic select query with lateral", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [
                { table: "a", name: "id", alias: "a_0", path: ["id"] },
                { table: "a", name: "name", alias: "a_1", path: ["name"] },
            ],
            joins: [],
            orderBy: [],
            lateralBy: {
                outerAlias: "b",
                innerAlias: "c",
                primaryKeys: [
                    {
                        column: "id",
                        type: "int",
                        values: [1, 2, 3],
                    },
                ],
            },
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "b".*
            FROM
                (
                    SELECT
                        UNNEST(ARRAY[$1, $2, $3]::int[]) AS "id"
                ) AS "c"
                JOIN LATERAL (
                    SELECT
                        "a"."id" AS "a_0",
                        "a"."name" AS "a_1"
                    FROM
                        "public"."users" AS "a"
                    WHERE
                        (1 = 1)
                        AND ("c"."id" = "a"."id")
                ) "b" ON TRUE
        `);
    });

    test("generates query with joins and lateral", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "a",
                model: "post",
            },
            columns: [
                { table: "a", name: "id", alias: "a_0", path: ["id"] },
                {
                    table: "b",
                    name: "name",
                    alias: "b_0",
                    path: ["author", "name"],
                },
            ],
            joins: [
                {
                    type: "LEFT",
                    relation: "author",
                    path: ["author"],
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
                },
            ],
            orderBy: [],
            lateralBy: {
                outerAlias: "c",
                innerAlias: "d",
                primaryKeys: [
                    {
                        column: "id",
                        type: "int",
                        values: [1, 2, 3],
                    },
                ],
            },
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "c".*
            FROM
                (
                    SELECT
                        UNNEST(ARRAY[$1, $2, $3]::int[]) AS "id"
                ) AS "d"
                JOIN LATERAL (
                    SELECT
                        "a"."id" AS "a_0",
                        "b"."name" AS "b_0"
                    FROM
                        "public"."posts" AS "a"
                        LEFT JOIN "public"."users" AS "b" ON "a"."author_id" = "b"."id"
                    WHERE
                        (1 = 1)
                        AND ("d"."id" = "a"."id")
                ) "c" ON TRUE
        `);
    });

    test("generates query with order by and lateral", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [{ table: "a", name: "id", alias: "a_0", path: ["id"] }],
            joins: [],
            orderBy: [
                {
                    column: {
                        table: "a",
                        name: "id",
                    },
                    direction: "ASC",
                },
            ],
            tableIndex: 0,
            lateralBy: {
                outerAlias: "b",
                innerAlias: "c",
                primaryKeys: [
                    {
                        column: "id",
                        type: "int",
                        values: [1, 2, 3],
                    },
                ],
            },
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "b".*
            FROM
                (
                    SELECT
                        UNNEST(ARRAY[$1, $2, $3]::int[]) AS "id"
                ) AS "c"
                JOIN LATERAL (
                    SELECT
                        "a"."id" AS "a_0"
                    FROM
                        "public"."users" AS "a"
                    WHERE
                        (1 = 1)
                        AND ("c"."id" = "a"."id")
                    ORDER BY
                        "a"."id" ASC
                ) "b" ON TRUE
        `);
    });

    test("generates query with limit, offset and lateral", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "a",
                model: "user",
            },
            columns: [{ table: "a", name: "id", alias: "a_0", path: ["id"] }],
            joins: [],
            orderBy: [],
            limit: 10,
            offset: 20,
            lateralBy: {
                outerAlias: "b",
                innerAlias: "c",
                primaryKeys: [
                    {
                        column: "id",
                        type: "int",
                        values: [1, 2, 3],
                    },
                ],
            },
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "b".*
            FROM
                (
                    SELECT
                        UNNEST(ARRAY[$1, $2, $3]::int[]) AS "id"
                ) AS "c"
                JOIN LATERAL (
                    SELECT
                        "a"."id" AS "a_0"
                    FROM
                        "public"."users" AS "a"
                    WHERE
                        (1 = 1)
                        AND ("c"."id" = "a"."id")
                    LIMIT
                        $4
                    OFFSET
                        $5
                ) "b" ON TRUE
        `);
    });

    test("generates query with subquery join for optional relations with nested joins", () => {
        const statement = findToSql({
            table: {
                schema: "public",
                name: "tasks",
                alias: "a",
                model: "task",
            },
            columns: [
                { table: "a", name: "id", alias: "a_0", path: ["id"] },
                { table: "a", name: "title", alias: "a_1", path: ["title"] },
                {
                    table: "b_subq",
                    name: "b_0",
                    alias: "b_0",
                    path: ["assignee", "name"],
                },
                {
                    table: "b_subq",
                    name: "b_1",
                    alias: "b_1",
                    path: ["assignee", "id"],
                },
                {
                    table: "b_subq",
                    name: "c_0",
                    alias: "c_0",
                    path: ["assignee", "department", "name"],
                },
                {
                    table: "b_subq",
                    name: "c_1",
                    alias: "c_1",
                    path: ["assignee", "department", "id"],
                },
            ],
            joins: [
                {
                    type: "LEFT",
                    relation: "assignee",
                    path: ["assignee"],
                    table: {
                        schema: "public",
                        name: "employees",
                        alias: "b",
                        model: "employee",
                    },
                    columns: [
                        {
                            from: { table: "a", name: "assignee_id" },
                            to: { table: "b_subq", name: "b_1" },
                        },
                    ],
                    subquery: {
                        alias: "b_subq",
                        columns: [
                            {
                                table: "b",
                                name: "name",
                                alias: "b_0",
                                path: ["assignee", "name"],
                            },
                            {
                                table: "b",
                                name: "id",
                                alias: "b_1",
                                path: ["assignee", "id"],
                            },
                            {
                                table: "c",
                                name: "name",
                                alias: "c_0",
                                path: ["assignee", "department", "name"],
                            },
                            {
                                table: "c",
                                name: "id",
                                alias: "c_1",
                                path: ["assignee", "department", "id"],
                            },
                        ],
                        joins: [
                            {
                                type: "INNER",
                                relation: "department",
                                path: ["assignee", "department"],
                                table: {
                                    schema: "public",
                                    name: "departments",
                                    alias: "c",
                                    model: "department",
                                },
                                columns: [
                                    {
                                        from: {
                                            table: "b",
                                            name: "department_id",
                                        },
                                        to: { table: "c", name: "id" },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
            orderBy: [],
            tableIndex: 0,
        });

        expect(statement.pretty).toBe(unindent`
            SELECT
                "a"."id" AS "a_0",
                "a"."title" AS "a_1",
                "b_subq"."b_0" AS "b_0",
                "b_subq"."b_1" AS "b_1",
                "b_subq"."c_0" AS "c_0",
                "b_subq"."c_1" AS "c_1"
            FROM
                "public"."tasks" AS "a"
                LEFT JOIN (
                    SELECT
                        "b"."name" AS "b_0",
                        "b"."id" AS "b_1",
                        "c"."name" AS "c_0",
                        "c"."id" AS "c_1"
                    FROM
                        "public"."employees" AS "b"
                        JOIN "public"."departments" AS "c" ON "b"."department_id" = "c"."id"
                ) AS "b_subq" ON "a"."assignee_id" = "b_subq"."b_1"
        `);
    });
});
