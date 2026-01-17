import { describe, expect, test } from "vitest";

import { $or } from "#operators.js";
import { hasClauses } from "./hasClauses.js";

describe("hasClauses", () => {
    test("it returns true if the clause is a value or an object with string or symbol keys", () => {
        expect(hasClauses({ a: 1 })).toBe(true);
        expect(hasClauses({ [$or]: [{ a: 1 }, { a: 2 }] })).toBe(true);
    });

    test("it returns false if the clause is null, undefined, an empty object, or a non-object value", () => {
        expect(hasClauses(null)).toBe(false);
        expect(hasClauses(undefined)).toBe(false);
        expect(hasClauses({})).toBe(false);
        expect(hasClauses("wrong")).toBe(false);
    });
});
