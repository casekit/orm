import { describe, expectTypeOf, test } from "vitest";
import { db } from "~/test/fixtures";

import { ColumnName } from "./ColumnName";
import { ModelName } from "./ModelName";

describe("ColumnName", () => {
    test("resolves to the union of the literal column names in a model", () => {
        const x: ModelName<typeof db> = "post";
        expectTypeOf<ColumnName<typeof db, typeof x>>().toEqualTypeOf<"id">();
    });
});
