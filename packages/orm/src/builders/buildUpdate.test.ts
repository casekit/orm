import { describe, expect, test } from "vitest";

import { SQLStatement, sql } from "@casekit/sql";
import { unindent } from "@casekit/unindent";

import { $like } from "#operators.js";
import { createTestDB } from "../tests/util/db.js";
import { buildUpdate } from "./buildUpdate.js";

describe("buildUpdate", () => {
    const { db } = createTestDB();

    test("builds basic update query", () => {
        const result = buildUpdate(db.config, [], "user", {
            set: { name: "John", email: "john@example.com" },
            where: { id: 1 },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "user",
                alias: "a",
                model: "user",
            },
            set: [
                ["name", "John"],
                ["email", "john@example.com"],
            ],
            where: sql`"a"."id" = ${1}`,
            returning: [],
        });
    });

    test("builds update query with returning clause", () => {
        const result = buildUpdate(db.config, [], "user", {
            set: { name: "John" },
            where: { id: 1 },
            returning: ["id", "name"],
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "user",
                alias: "a",
                model: "user",
            },
            set: [["name", "John"]],
            where: sql`"a"."id" = ${1}`,
            returning: [
                {
                    name: "id",
                    alias: "a_0",
                    path: ["id"],
                },
                {
                    name: "name",
                    alias: "a_1",
                    path: ["name"],
                },
            ],
        });
    });

    test("throws error for nonexistent model", () => {
        expect(() =>
            buildUpdate(db.config, [], "nonexistent", {
                set: { name: "John" },
                where: { id: 1 },
            }),
        ).toThrow('Model "nonexistent" not found');
    });

    test("throws error when where clause is empty", () => {
        expect(() =>
            buildUpdate(db.config, [], "user", {
                set: { name: "John" },
                where: {},
            }),
        ).toThrow("Update queries must have a where clause");
    });

    test("throws error when where clause is undefined", () => {
        expect(() =>
            buildUpdate(db.config, [], "user", {
                set: { name: "John" },
                // @ts-expect-error testing runtime behavior
                where: undefined,
            }),
        ).toThrow("Update queries must have a where clause");
    });

    test("handles nested paths in returning clause", () => {
        const result = buildUpdate(
            db.config,
            [],
            "user",
            {
                set: { name: "John" },
                where: { id: 1 },
                returning: ["id", "name"],
            },
            ["parent"],
        );

        expect(result.returning).toEqual([
            {
                name: "id",
                alias: "a_0",
                path: ["parent", "id"],
            },
            {
                name: "name",
                alias: "a_1",
                path: ["parent", "name"],
            },
        ]);
    });

    test("uses provided table index for alias", () => {
        const result = buildUpdate(
            db.config,
            [],
            "user",
            {
                set: { name: "John" },
                where: { id: 1 },
            },
            [],
            5,
        );

        expect(result.table.alias).toBe("f");
    });

    test("handles complex where clauses", () => {
        const result = buildUpdate(db.config, [], "user", {
            set: { name: "John" },
            where: {
                id: 1,
                name: "test",
                email: { [$like]: "%@example.com" },
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "user",
                alias: "a",
                model: "user",
            },
            set: [["name", "John"]],
            where: expect.any(SQLStatement),
            returning: [],
        });
        expect(result.where?.pretty).toEqual(unindent`
            "a"."id" = $1
            AND "a"."name" = $2
            AND "a"."email" LIKE $3
        `);
        expect(result.where?.values).toEqual([1, "test", "%@example.com"]);
    });
});
