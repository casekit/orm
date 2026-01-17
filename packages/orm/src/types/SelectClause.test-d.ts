import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { SelectClause } from "./SelectClause.js";

describe("SelectClause", () => {
    test("accepts array of valid field names", () => {
        expectTypeOf<["id", "title", "content"]>().toExtend<
            SelectClause<Models["post"]>
        >();
    });

    test("requires at least one field", () => {
        expectTypeOf<[]>().not.toExtend<SelectClause<Models["post"]>>();
    });

    test("rejects invalid field names", () => {
        expectTypeOf<["id", "invalid"]>().not.toExtend<
            SelectClause<Models["post"]>
        >();
    });

    test("accepts single field array", () => {
        expectTypeOf<["id"]>().toExtend<SelectClause<Models["post"]>>();
    });
});
