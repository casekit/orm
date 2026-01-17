import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { ReturningClause } from "./ReturningClause.js";

describe("ReturningClause", () => {
    test("accepts array of valid field names", () => {
        expectTypeOf<["id", "title", "content"]>().toExtend<
            ReturningClause<Models["post"]>
        >();
    });

    test("requires at least one field", () => {
        expectTypeOf<[]>().not.toExtend<ReturningClause<Models["post"]>>();
    });

    test("rejects invalid field names", () => {
        expectTypeOf<["id", "invalid"]>().not.toExtend<
            ReturningClause<Models["post"]>
        >();
    });

    test("accepts single field array", () => {
        expectTypeOf<["id"]>().toExtend<ReturningClause<Models["post"]>>();
    });
});
