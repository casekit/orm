import { describe, expect, test } from "vitest";

import { isNonEmptyClause } from "./isNonEmptyClause";

describe("isNonEmptyClause", () => {
    test("should return true for non-empty clause", () => {
        const clause = { field: "name", operator: "equals", value: "John" };
        expect(isNonEmptyClause(clause)).toBe(true);
    });

    test("should return false for null clause", () => {
        const clause = null;
        expect(isNonEmptyClause(clause)).toBe(false);
    });

    test("should return false for undefined clause", () => {
        const clause = undefined;
        expect(isNonEmptyClause(clause)).toBe(false);
    });

    test("should return false for empty object clause", () => {
        const clause = {};
        expect(isNonEmptyClause(clause)).toBe(false);
    });

    test("should return true for an object clause that contains only symbol keys", () => {
        const sym = Symbol("test");
        const clause = { [sym]: 2 };
        expect(isNonEmptyClause(clause)).toBe(true);
    });

    test("should return false for empty array clause", () => {
        const clause: string[] = [];
        expect(isNonEmptyClause(clause)).toBe(false);
    });
});
