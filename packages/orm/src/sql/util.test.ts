import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";
import { unindent } from "@casekit/unindent";

import { Column, Join, OrderBy, Table } from "#builders/types.js";
import {
    columnName,
    joinClause,
    orderByColumn,
    selectColumn,
    setClause,
    tableName,
    unnestPk,
} from "./util.js";

describe("SQL utility functions", () => {
    test("tableName should format table identifier correctly", () => {
        const table: Table = {
            schema: "public",
            name: "users",
            alias: "u",
            model: "user",
        };
        expect(tableName(table).text).toBe('"public"."users" AS "u"');
    });

    test("columnName should format column identifier correctly", () => {
        const column: Column = { table: "users", name: "id" };
        expect(columnName(column).text).toBe('"users"."id"');
    });

    test("selectColumn should format column with alias", () => {
        const column = {
            table: "users",
            name: "first_name",
            alias: "name",
            path: [],
        };
        expect(selectColumn(column).text).toBe(
            '"users"."first_name" AS "name"',
        );
    });

    test("unnestPk should format primary key array correctly", () => {
        const pk = {
            column: "id",
            type: "uuid",
            values: ["123", "456"],
        };
        expect(unnestPk(pk).text).toBe('UNNEST(ARRAY[$1, $2]::uuid[]) AS "id"');
    });

    test("joinClause should format INNER JOIN correctly for N:1 relation", () => {
        const join: Join = {
            type: "INNER",
            path: ["author"],
            relation: "author",
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: [
                {
                    from: { table: "p", name: "author_id" },
                    to: { table: "u", name: "id" },
                },
            ],
        };
        expect(joinClause(join).pretty).toBe(
            'JOIN "public"."users" AS "u" ON "p"."author_id" = "u"."id"',
        );
    });

    test("joinClause should format LEFT JOIN correctly for N:1 relation", () => {
        const join: Join = {
            type: "LEFT",
            path: ["author"],
            relation: "author",
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: [
                {
                    from: { table: "p", name: "author_id" },
                    to: { table: "u", name: "id" },
                },
            ],
        };
        expect(joinClause(join).pretty).toBe(
            'LEFT JOIN "public"."users" AS "u" ON "p"."author_id" = "u"."id"',
        );
    });

    test("joinClause should format LEFT JOIN correctly for N:1 relation with compound key", () => {
        const join: Join = {
            type: "LEFT",
            relation: "organization",
            path: ["organization"],
            table: {
                schema: "public",
                name: "organizations",
                alias: "o",
                model: "organization",
            },
            columns: [
                {
                    from: { table: "u", name: "org_id" },
                    to: { table: "o", name: "id" },
                },
                {
                    from: { table: "u", name: "org_type" },
                    to: { table: "o", name: "type" },
                },
            ],
        };
        expect(joinClause(join).pretty).toBe(unindent`
            LEFT JOIN "public"."organizations" AS "o" ON "u"."org_id" = "o"."id"
            AND "u"."org_type" = "o"."type"
        `);
    });

    test("joinClause should include where clause when provided for N:1 relation", () => {
        const join: Join = {
            type: "LEFT",
            relation: "author",
            path: ["author"],
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: [
                {
                    from: { table: "p", name: "author_id" },
                    to: { table: "u", name: "id" },
                },
            ],
            where: sql`"u"."deleted_at" IS NULL`,
        };
        expect(joinClause(join).pretty).toBe(unindent`
                LEFT JOIN "public"."users" AS "u" ON "p"."author_id" = "u"."id"
                AND "u"."deleted_at" IS NULL
            `);
    });

    test("orderByColumn should format ASC order correctly", () => {
        const orderBy: OrderBy = {
            column: { table: "users", name: "created_at" },
            direction: "ASC",
        };
        expect(orderByColumn(orderBy).pretty).toBe('"users"."created_at" ASC');
    });

    test("orderByColumn should format DESC order correctly", () => {
        const orderBy: OrderBy = {
            column: { table: "posts", name: "likes" },
            direction: "DESC",
        };
        expect(orderByColumn(orderBy).pretty).toBe('"posts"."likes" DESC');
    });
});

describe("setClause", () => {
    test("setClause should format column and value correctly", () => {
        const pair: [string, unknown] = ["first_name", "John"];
        expect(setClause(pair).text).toBe('"first_name" = $1');
    });

    test("setClause should handle numbers", () => {
        const pair: [string, unknown] = ["age", 25];
        expect(setClause(pair).text).toBe('"age" = $1');
    });

    test("setClause should handle null values", () => {
        const pair: [string, unknown] = ["deleted_at", null];
        expect(setClause(pair).text).toBe('"deleted_at" = NULL');
    });

    test("setClause should handle boolean values", () => {
        const pair: [string, unknown] = ["is_active", true];
        expect(setClause(pair).text).toBe('"is_active" = TRUE');
    });
});
