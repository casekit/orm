import { describe, expect, test } from "vitest";

import { tableAlias } from "./tableAlias";

describe("tableAlias", () => {
    test.each([
        [0, "a"],
        [1, "b"],
        [26, "aa"],
        [27, "ab"],
        [51, "az"],
        [52, "ba"],
        [104, "da"],
        [105, "db"],
        [42000, "bjck"],
        [42001, "bjcl"],
    ])("tableAlias(%s) => %s", (index, expected) => {
        expect(tableAlias(index)).toEqual(expected);
    });
});
