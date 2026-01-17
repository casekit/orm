import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";

import { createTestDB } from "../tests/util/db.js";
import { buildDelete } from "./buildDelete.js";

describe("buildDelete", () => {
    const { db } = createTestDB();

    test("builds basic delete query with where clause", () => {
        const result = buildDelete(db.config, [], "user", {
            where: { id: 1 },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "user",
                alias: "a",
                model: "user",
            },
            where: sql`"a"."id" = ${1}`,
            returning: [],
        });
    });

    test("builds delete query with returning clause", () => {
        const result = buildDelete(db.config, [], "user", {
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

    test("throws error when model not found", () => {
        expect(() =>
            buildDelete(db.config, [], "nonexistentModel", {
                where: { id: 1 },
            }),
        ).toThrow('Model "nonexistentModel" not found');
    });

    test("throws error when where clause is empty", () => {
        expect(() =>
            buildDelete(db.config, [], "user", {
                where: {},
            }),
        ).toThrow("Delete queries must have a where clause");
    });

    test("throws error when where clause is undefined", () => {
        expect(() =>
            buildDelete(db.config, [], "user", {
                // @ts-expect-error testing runtime behavior with invalid input
                where: undefined,
            }),
        ).toThrow("Delete queries must have a where clause");
    });

    test("handles complex where clauses", () => {
        const result = buildDelete(db.config, [], "user", {
            where: {
                id: 1,
                name: "test",
                email: { $like: "%@example.com" },
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "user",
                alias: "a",
                model: "user",
            },
            where: expect.any(Object), // SQL statement object
            returning: [],
        });
    });

    test("uses correct path for nested fields in returning clause", () => {
        const result = buildDelete(
            db.config,
            [],
            "user",
            {
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

    test("uses provided table index for alias generation", () => {
        const result = buildDelete(
            db.config,
            [],
            "user",
            {
                where: { id: 1 },
            },
            [],
            5,
        );

        expect(result.table.alias).toBe("f");
    });
});
