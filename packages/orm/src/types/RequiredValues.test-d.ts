import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { RequiredValues } from "./RequiredValues.js";

describe("RequiredValues", () => {
    test("model with required fields", () => {
        const _: RequiredValues<Models["post"]> = {
            title: "Title",
            content: "Content",
            authorId: 1,
        };
    });

    test("is never for model with only optional fields", () => {
        expectTypeOf<
            RequiredValues<Models["counter"]>
        >().toEqualTypeOf<never>();
    });

    test("model with serial primary key", () => {
        expectTypeOf<"userId">().not.toExtend<
            keyof RequiredValues<Models["user"]>
        >();
    });

    test("model with provided fields", () => {
        expectTypeOf<"change">().not.toExtend<
            keyof RequiredValues<Models["audit"]>
        >();
    });

    test("model with nullable fields", () => {
        expectTypeOf<"deletedAt">().not.toExtend<
            keyof RequiredValues<Models["user"]>
        >();
    });
});
