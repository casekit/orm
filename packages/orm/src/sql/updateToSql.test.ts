import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";
import { unindent } from "@casekit/unindent";

import { updateToSql } from "./updateToSql.js";

describe("updateToSql", () => {
    test("generates basic update query", () => {
        const statement = updateToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            set: [
                ["name", "John"],
                ["email", "john@example.com"],
            ],
            where: sql`id = 1`,
            returning: [],
        });

        expect(statement.pretty).toBe(unindent`
            UPDATE "public"."users" AS "u"
            SET
                "name" = $1,
                "email" = $2
            WHERE
                id = 1
        `);

        expect(statement.values).toEqual(["John", "john@example.com"]);
    });

    test("can update array fields", () => {
        const statement = updateToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "p",
                model: "post",
            },
            set: [
                ["title", "My first post"],
                ["content", "Hello, world!"],
                ["tags", ["hello", "world"]],
            ],
            returning: [
                { name: "id", alias: "p_0", path: ["id"] },
                { name: "tags", alias: "p_1", path: ["tags"] },
            ],
            where: sql`id = 1`,
        });

        expect(statement.pretty).toBe(unindent`
            UPDATE "public"."posts" AS "p"
            SET
                "title" = $1,
                "content" = $2,
                "tags" = $3
            WHERE
                id = 1
            RETURNING
                "id" AS "p_0",
                "tags" AS "p_1"
      `);

        expect(statement.values).toEqual([
            "My first post",
            "Hello, world!",
            ["hello", "world"],
        ]);
    });

    test("generates query with returning clause", () => {
        const statement = updateToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            set: [["name", "John"]],
            where: sql`id = 1`,
            returning: [
                { name: "id", alias: "u_0", path: ["id"] },
                { name: "name", alias: "u_1", path: ["name"] },
            ],
        });

        expect(statement.pretty).toBe(unindent`
            UPDATE "public"."users" AS "u"
            SET
                "name" = $1
            WHERE
                id = 1
            RETURNING
                "id" AS "u_0",
                "name" AS "u_1"
        `);

        expect(statement.values).toEqual(["John"]);
    });

    test("handles multiple set clauses", () => {
        const statement = updateToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            set: [
                ["first_name", "John"],
                ["last_name", "Doe"],
                ["email", "john@example.com"],
            ],
            where: sql`id = 1`,
            returning: [],
        });

        expect(statement.pretty).toBe(unindent`
            UPDATE "public"."users" AS "u"
            SET
                "first_name" = $1,
                "last_name" = $2,
                "email" = $3
            WHERE
                id = 1
        `);

        expect(statement.values).toEqual(["John", "Doe", "john@example.com"]);
    });

    test("handles complex where clause", () => {
        const statement = updateToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            set: [["name", "John"]],
            where: sql`id = ${1} AND email LIKE ${"@example.com"}`,
            returning: [],
        });

        expect(statement.pretty).toBe(unindent`
            UPDATE "public"."users" AS "u"
            SET
                "name" = $1
            WHERE
                id = $2
                AND email LIKE $3
        `);

        expect(statement.values).toEqual(["John", 1, "@example.com"]);
    });

    test("handles null values", () => {
        const statement = updateToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            set: [["deleted_at", null]],
            where: sql`id = 1`,
            returning: [],
        });

        expect(statement.pretty).toBe(unindent`
            UPDATE "public"."users" AS "u"
            SET
                "deleted_at" = NULL
            WHERE
                id = 1
        `);

        expect(statement.values).toEqual([]);
    });
});
