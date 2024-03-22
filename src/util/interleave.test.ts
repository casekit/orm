import { describe, expect, test } from "vitest";

import { interleave } from "./interleave";

describe("interleave", () => {
    test("it interleaves a value between elements of a list", () => {
        expect(interleave([1, 2, 3], "x")).toEqual([1, "x", 2, "x", 3]);
    });

    test("it works with empty lists", () => {
        expect(interleave([], "x")).toEqual([]);
    });

    test("it works with long lists", () => {
        expect(interleave([1, 2, 3, 1, 2, 3, 1, 2, 3], "x")).toEqual([
            1,
            "x",
            2,
            "x",
            3,
            "x",
            1,
            "x",
            2,
            "x",
            3,
            "x",
            1,
            "x",
            2,
            "x",
            3,
        ]);
    });
});
