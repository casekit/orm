import { describe, expect, test } from "vitest";

import { unindent } from "@casekit/unindent";

import { createToSql } from "./createToSql.js";

describe("createToSql", () => {
    test("basic insert with columns and values", () => {
        const result = createToSql({
            table: { schema: "orm", name: "users", alias: "u", model: "user" },
            columns: ["name", "email"],
            values: [["John", "john@example.com"]],
            returning: [],
        });

        expect(result.pretty).toBe(unindent`            
            INSERT INTO
                "orm"."users" AS "u" ("name", "email")
            VALUES
                ($1, $2)
        `);
        expect(result.values).toEqual(["John", "john@example.com"]);
    });

    test("insert with DEFAULT VALUES", () => {
        const result = createToSql({
            table: { schema: "orm", name: "users", alias: "u", model: "user" },
            columns: [],
            values: [],
            returning: [],
        });

        expect(result.pretty).toBe(unindent`
            INSERT INTO
                "orm"."users" AS "u"
            DEFAULT VALUES
        `);
        expect(result.values).toEqual([]);
    });

    test("insert with ON CONFLICT DO NOTHING", () => {
        const result = createToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: ["name"],
            values: [["John"]],
            returning: [],
            onConflict: { do: "nothing" },
        });

        expect(result.pretty).toBe(unindent`
            INSERT INTO
                "public"."users" AS "u" ("name")
            VALUES
                ($1)
            ON CONFLICT DO NOTHING
        `);
        expect(result.values).toEqual(["John"]);
    });

    test("insert with RETURNING clause", () => {
        const result = createToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: ["name"],
            values: [["John"]],
            returning: [{ name: "id", alias: "u_0", path: ["id"] }],
        });

        expect(result.pretty).toBe(unindent`
            INSERT INTO
                "public"."users" AS "u" ("name")
            VALUES
                ($1)
            RETURNING
                "id" AS "u_0"
        `);
        expect(result.values).toEqual(["John"]);
    });

    test("insert multiple rows with multiple returned fields", () => {
        const result = createToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: ["name", "email", "age"],
            values: [
                ["John", "john@example.com", 25],
                ["Jane", "jane@example.com", 30],
                ["Bob", "bob@example.com", 35],
            ],
            returning: [
                { name: "id", alias: "u_0", path: ["id"] },
                { name: "created_at", alias: "u_1", path: ["created_at"] },
                { name: "email", alias: "u_2", path: ["email"] },
            ],
        });

        expect(result.pretty).toBe(unindent`
            INSERT INTO
                "public"."users" AS "u" ("name", "email", "age")
            VALUES
                ($1, $2, $3),
                ($4, $5, $6),
                ($7, $8, $9)
            RETURNING
                "id" AS "u_0",
                "created_at" AS "u_1",
                "email" AS "u_2"
        `);
        expect(result.values).toEqual([
            "John",
            "john@example.com",
            25,
            "Jane",
            "jane@example.com",
            30,
            "Bob",
            "bob@example.com",
            35,
        ]);
    });

    test("insert array values", () => {
        const result = createToSql({
            table: {
                schema: "public",
                name: "posts",
                alias: "p",
                model: "post",
            },
            columns: ["title", "content", "tags"],
            values: [
                ["My first post", "Hello, world!", ["hello", "world"]],
                ["My second post", "Goodbye, world!", ["goodbye", "world"]],
            ],
            returning: [
                { name: "id", alias: "p_0", path: ["id"] },
                { name: "tags", alias: "p_1", path: ["tags"] },
            ],
        });

        expect(result.pretty).toBe(unindent`
            INSERT INTO
                "public"."posts" AS "p" ("title", "content", "tags")
            VALUES
                ($1, $2, $3),
                ($4, $5, $6)
            RETURNING
                "id" AS "p_0",
                "tags" AS "p_1"
        `);
        expect(result.values).toEqual([
            "My first post",
            "Hello, world!",
            ["hello", "world"],
            "My second post",
            "Goodbye, world!",
            ["goodbye", "world"],
        ]);
    });

    test("insert with ON CONFLICT DO NOTHING and RETURNING with DEFAULT VALUES", () => {
        const result = createToSql({
            table: {
                schema: "public",
                name: "users",
                alias: "u",
                model: "user",
            },
            columns: [],
            values: [],
            returning: [
                { name: "id", alias: "u_0", path: ["id"] },
                { name: "created_at", alias: "u_1", path: ["created_at"] },
            ],
            onConflict: { do: "nothing" },
        });

        expect(result.pretty).toBe(unindent`
            INSERT INTO
                "public"."users" AS "u"
            DEFAULT VALUES
            ON CONFLICT DO NOTHING
            RETURNING
                "id" AS "u_0",
                "created_at" AS "u_1"
        `);
        expect(result.values).toEqual([]);
    });
});
