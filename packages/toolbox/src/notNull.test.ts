import { expect, test } from "vitest";

import { notNull } from "./notNull.js";

test("notNull returns false for null", () => {
    expect(notNull(null)).toBe(false);
});

test("notNull returns true for non-null values", () => {
    expect(notNull(0)).toBe(true);
    expect(notNull("")).toBe(true);
    expect(notNull(false)).toBe(true);
    expect(notNull({})).toBe(true);
    expect(notNull([])).toBe(true);
    expect(notNull(undefined)).toBe(true);
});

test("notNull type guard narrows type correctly", () => {
    const arr = [1, null, 2, null, 3];
    const numbers = arr.filter(notNull);
    // @ts-expect-error numbers should not contain null
    const _test: null = numbers[0];
});
