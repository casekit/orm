import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";

import { createTestDB } from "../tests/util/db.js";
import { buildCount } from "./buildCount.js";

describe("buildCount", () => {
    const { db } = createTestDB();

    test("builds basic count query", () => {
        const result = buildCount(db.config, [], "post", {});

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            where: null,
            joins: [],
            for: undefined,
            tableIndex: 1,
        });
    });

    test("builds count query with N:1 relation include", () => {
        const result = buildCount(db.config, [], "post", {
            where: { id: 1 },
            include: {
                author: {
                    where: {},
                },
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            where: sql`"a"."id" = ${1}`,
            joins: [
                {
                    relation: "author",
                    table: {
                        schema: "orm",
                        name: "user",
                        alias: "b",
                        model: "user",
                    },
                    where: null,
                    type: "INNER",
                    path: ["author"],
                    columns: [
                        {
                            from: { table: "a", name: "author_id" },
                            to: { table: "b", name: "id" },
                        },
                    ],
                },
            ],
            for: undefined,
            tableIndex: 2,
        });
    });

    test("builds count query with where clause", () => {
        const result = buildCount(db.config, [], "post", {
            where: {
                title: "Test Post",
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            where: sql`"a"."title" = ${"Test Post"}`,
            joins: [],
            for: undefined,
            tableIndex: 1,
        });
    });

    test("builds count query with nested includes and where clauses", () => {
        const result = buildCount(db.config, [], "post", {
            where: {
                title: "Test Post",
            },
            include: {
                author: {
                    where: {
                        name: "John",
                    },
                },
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            where: sql`"a"."title" = ${"Test Post"}`,
            joins: [
                {
                    relation: "author",
                    table: {
                        schema: "orm",
                        name: "user",
                        alias: "b",
                        model: "user",
                    },
                    where: sql`"b"."name" = ${"John"}`,
                    type: "INNER",
                    path: ["author"],
                    columns: [
                        {
                            from: { table: "a", name: "author_id" },
                            to: { table: "b", name: "id" },
                        },
                    ],
                },
            ],
            for: undefined,
            tableIndex: 2,
        });
    });

    test("builds count query with for parameter", () => {
        const result = buildCount(db.config, [], "post", {
            for: "update",
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            where: null,
            joins: [],
            for: "update",
            tableIndex: 1,
        });
    });
});
