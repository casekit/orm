import { describe, expectTypeOf, test } from "vitest";

import { Simplify } from "./Simplify.js";

describe("Simplify", () => {
    test("simplify doesn't change the structure of a type containing nested objects, strings, numbers, dates and arrays", () => {
        type NestedObject = {
            a: { b: { c: string; d: Date; e: number[]; f: { g: null }[] } };
        };

        expectTypeOf<Simplify<NestedObject>>().toEqualTypeOf<NestedObject>();
    });
});
