import { describe, expect, test } from "vitest";

import {
    $and,
    $eq,
    $gt,
    $gte,
    $ilike,
    $in,
    $is,
    $like,
    $lt,
    $lte,
    $ne,
    $not,
    $or,
} from "../operators.js";
import { orm } from "../orm.js";
import { Middleware } from "../types/Middleware.js";
import { buildWhere } from "./buildWhere.js";
import { Table } from "./types.js";

describe("buildWhere", () => {
    const db = orm({
        models: {
            user: {
                fields: {
                    id: { column: "id", type: "integer", primaryKey: true },
                    name: { column: "name", type: "text" },
                    active: { column: "active", type: "boolean" },
                    createdAt: { column: "created_at", type: "timestamp" },
                },
            },
        },
        operators: { where: {} },
    });

    const table: Table = {
        schema: "public",
        model: "user",
        alias: "u",
        name: "user",
    };

    test("builds simple equality clause", () => {
        const where = { id: 1 };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" = $1');
        expect(result.values).toEqual([1]);
    });

    test("builds IS NULL clause", () => {
        const where = { name: null };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."name" IS NULL');
    });

    test("builds boolean clauses", () => {
        const whereTrue = { active: true };
        const whereFalse = { active: false };

        expect(buildWhere(db.config, [], table, whereTrue)!.text).toBe(
            '"u"."active" IS TRUE',
        );
        expect(buildWhere(db.config, [], table, whereFalse)!.text).toBe(
            '"u"."active" IS FALSE',
        );
    });

    test("builds AND clause", () => {
        const where = { [$and]: [{ id: 1 }, { name: "test" }] };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('("u"."id" = $1 AND "u"."name" = $2)');
        expect(result.values).toEqual([1, "test"]);
    });

    test("builds OR clause", () => {
        const where = { [$or]: [{ id: 1 }, { name: "test" }] };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('("u"."id" = $1 OR "u"."name" = $2)');
        expect(result.values).toEqual([1, "test"]);
    });

    test("builds NOT clause", () => {
        const where = { [$not]: { active: true } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('NOT "u"."active" IS TRUE');
    });

    test("throws error for unrecognized field", () => {
        const where = { unknownField: 1 };
        expect(() => buildWhere(db.config, [], table, where)).toThrow(
            "Unrecognised field",
        );
    });

    test("handles Date objects", () => {
        const date = new Date("2023-01-01");
        const where = { createdAt: date };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."created_at" = $1');
        expect(result.values).toEqual([date]);
    });

    test("builds $eq operator clause", () => {
        const where = { id: { [$eq]: 1 } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" = $1');
        expect(result.values).toEqual([1]);
    });

    test("builds $gt operator clause", () => {
        const where = { id: { [$gt]: 1 } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" > $1');
        expect(result.values).toEqual([1]);
    });

    test("builds $gte operator clause", () => {
        const where = { id: { [$gte]: 1 } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" >= $1');
        expect(result.values).toEqual([1]);
    });

    test("builds $ilike operator clause", () => {
        const where = { name: { [$ilike]: "%test%" } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."name" ILIKE $1');
        expect(result.values).toEqual(["%test%"]);
    });

    test("builds $is operator clause", () => {
        const where = { name: { [$is]: null } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."name" IS NULL');
        expect(result.values).toEqual([]);
    });

    test("builds $not operator clause", () => {
        const where = { name: { [$not]: null } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."name" IS NOT NULL');
        expect(result.values).toEqual([]);
    });

    test("builds $like operator clause", () => {
        const where = { name: { [$like]: "%test%" } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."name" LIKE $1');
        expect(result.values).toEqual(["%test%"]);
    });

    test("builds $lt operator clause", () => {
        const where = { id: { [$lt]: 1 } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" < $1');
        expect(result.values).toEqual([1]);
    });

    test("builds $lte operator clause", () => {
        const where = { id: { [$lte]: 1 } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" <= $1');
        expect(result.values).toEqual([1]);
    });

    test("builds $ne operator clause", () => {
        const where = { id: { [$ne]: 1 } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" != $1');
        expect(result.values).toEqual([1]);
    });

    test("builds $not operator clause with null", () => {
        const where = { name: { [$not]: null } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."name" IS NOT NULL');
    });

    test("throws error when $not operator receives non-null or boolean value", () => {
        const where = { name: { [$not]: "test" } };
        expect(() => buildWhere(db.config, [], table, where)).toThrow(
            "Invalid value passed to $not operator",
        );
    });

    test("builds $in operator clause", () => {
        const where = { id: { [$in]: [1, 2, 3] } };
        const result = buildWhere(db.config, [], table, where)!;
        expect(result.text).toBe('"u"."id" IN ($1, $2, $3)');
        expect(result.values).toEqual([1, 2, 3]);
    });

    test("throws error when $in operator receives non-array value", () => {
        const where = { id: { [$in]: 1 } };
        expect(() => buildWhere(db.config, [], table, where)).toThrow(
            "Non-array passed to IN clause",
        );
    });

    test("throws error for unrecognised operator", () => {
        const unknownSymbol = Symbol("unknown");
        const where = { id: { [unknownSymbol]: 1 } };
        expect(() => buildWhere(db.config, [], table, where)).toThrow(
            "Unrecognised query operator or value",
        );
    });

    test("applies where middleware", () => {
        const middleware: Middleware[] = [
            {
                where: (_config, _modelName, where) => {
                    // Add a soft delete filter
                    return { active: true, ...where };
                },
            },
        ];

        const where = { id: 1 };
        const result = buildWhere(db.config, middleware, table, where)!;

        // Should include both the original where clause and the middleware-added clause
        expect(result.text).toBe('"u"."active" IS TRUE AND "u"."id" = $1');
        expect(result.values).toEqual([1]);
    });
});
