import { describe, expect, test } from "vitest";

import { arrayToSqlArray } from "./arrayToSqlArray.js";

describe("arrayToSqlArray", () => {
    test("converts a flat array to SQL array format", () => {
        const input = [1, 2, 3];
        const output = arrayToSqlArray(input);
        expect(output).toBe("{ 1, 2, 3 }");
    });

    test("converts a nested array to SQL array format", () => {
        const input = [1, [2, 3], 4];
        const output = arrayToSqlArray(input);
        expect(output).toBe("{ 1, { 2, 3 }, 4 }");
    });

    test("converts an array with strings to SQL array format", () => {
        const input = ["a", "b", "c"];
        const output = arrayToSqlArray(input);
        expect(output).toBe('{ "a", "b", "c" }');
    });

    test("converts a mixed array to SQL array format", () => {
        const input = [1, "b", [2, "c"]];
        const output = arrayToSqlArray(input);
        expect(output).toBe('{ 1, "b", { 2, "c" } }');
    });

    test("converts an empty array to SQL array format", () => {
        const input: unknown[] = [];
        const output = arrayToSqlArray(input);
        expect(output).toBe("{  }");
    });
});
