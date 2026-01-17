import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";

import {
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
    defaultOperators,
} from "../operators.js";

describe("operators", () => {
    const table = sql`a`;
    const column = sql`a_0`;

    describe("basic comparison operators", () => {
        test("$eq", () => {
            const fragment = defaultOperators[$eq]({ table, column }, 42);
            expect(fragment.text).toBe("a.a_0 = $1");
            expect(fragment.values).toEqual([42]);
        });

        test("$gt", () => {
            const fragment = defaultOperators[$gt]({ table, column }, 42);
            expect(fragment.text).toBe("a.a_0 > $1");
            expect(fragment.values).toEqual([42]);
        });

        test("$gte", () => {
            const fragment = defaultOperators[$gte]({ table, column }, 42);
            expect(fragment.text).toBe("a.a_0 >= $1");
            expect(fragment.values).toEqual([42]);
        });

        test("$lt", () => {
            const fragment = defaultOperators[$lt]({ table, column }, 42);
            expect(fragment.text).toBe("a.a_0 < $1");
            expect(fragment.values).toEqual([42]);
        });

        test("$lte", () => {
            const fragment = defaultOperators[$lte]({ table, column }, 42);
            expect(fragment.text).toBe("a.a_0 <= $1");
            expect(fragment.values).toEqual([42]);
        });

        test("$ne", () => {
            const fragment = defaultOperators[$ne]({ table, column }, 42);
            expect(fragment.text).toBe("a.a_0 != $1");
            expect(fragment.values).toEqual([42]);
        });

        test("NULL, true and false are inserted directly rather than being used as parameters", () => {
            const fragment = defaultOperators[$eq]({ table, column }, null);
            expect(fragment.text).toBe("a.a_0 = NULL");
            expect(fragment.values).toEqual([]);

            const fragment2 = defaultOperators[$eq]({ table, column }, true);
            expect(fragment2.text).toBe("a.a_0 = TRUE");
            expect(fragment2.values).toEqual([]);

            const fragment3 = defaultOperators[$eq]({ table, column }, false);
            expect(fragment3.text).toBe("a.a_0 = FALSE");
            expect(fragment3.values).toEqual([]);
        });
    });

    describe("pattern matching operators", () => {
        test("$like", () => {
            const fragment = defaultOperators[$like](
                { table, column },
                "%test%",
            );
            expect(fragment.text).toBe("a.a_0 LIKE $1");
            expect(fragment.values).toEqual(["%test%"]);
        });

        test("$ilike", () => {
            const fragment = defaultOperators[$ilike](
                { table, column },
                "%TEST%",
            );
            expect(fragment.text).toBe("a.a_0 ILIKE $1");
            expect(fragment.values).toEqual(["%TEST%"]);
        });
    });

    describe("$is operator", () => {
        test("with null", () => {
            const fragment = defaultOperators[$is]({ table, column }, null);
            expect(fragment.text).toBe("a.a_0 IS NULL");
            expect(fragment.values).toEqual([]);
        });

        test("with true", () => {
            const fragment = defaultOperators[$is]({ table, column }, true);
            expect(fragment.text).toBe("a.a_0 IS TRUE");
            expect(fragment.values).toEqual([]);
        });

        test("with false", () => {
            const fragment = defaultOperators[$is]({ table, column }, false);
            expect(fragment.text).toBe("a.a_0 IS FALSE");
            expect(fragment.values).toEqual([]);
        });
    });

    describe("$in operator", () => {
        test("with array of values", () => {
            const fragment = defaultOperators[$in](
                { table, column },
                [1, 2, 3],
            );
            expect(fragment.text).toBe("a.a_0 IN ($1, $2, $3)");
            expect(fragment.values).toEqual([1, 2, 3]);
        });

        test("with empty array", () => {
            const fragment = defaultOperators[$in]({ table, column }, []);
            expect(fragment.text).toBe("a.a_0 IN (NULL)");
            expect(fragment.values).toEqual([]);
        });

        test("throws error with non-array value", () => {
            expect(() => {
                defaultOperators[$in]({ table, column }, "not-an-array");
            }).toThrow("Non-array passed to IN clause");
        });
    });

    describe("$not operator", () => {
        test("with null", () => {
            const fragment = defaultOperators[$not]({ table, column }, null);
            expect(fragment.text).toBe("a.a_0 IS NOT NULL");
            expect(fragment.values).toEqual([]);
        });

        test("with true", () => {
            const fragment = defaultOperators[$not]({ table, column }, true);
            expect(fragment.text).toBe("a.a_0 IS NOT TRUE");
            expect(fragment.values).toEqual([]);
        });

        test("with false", () => {
            const fragment = defaultOperators[$not]({ table, column }, false);
            expect(fragment.text).toBe("a.a_0 IS NOT FALSE");
            expect(fragment.values).toEqual([]);
        });

        test("throws error with invalid value", () => {
            expect(() => {
                defaultOperators[$not]({ table, column }, "invalid");
            }).toThrow("Invalid value passed to $not operator");
        });
    });

    describe("edge cases", () => {
        test("handles special characters in values", () => {
            const fragment = defaultOperators[$eq](
                { table, column },
                "value with 'quotes' and spaces",
            );
            expect(fragment.text).toBe("a.a_0 = $1");
            expect(fragment.values).toEqual(["value with 'quotes' and spaces"]);
        });
    });
});
