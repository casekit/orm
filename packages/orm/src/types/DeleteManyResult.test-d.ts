import { describe, expectTypeOf, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { DeleteManyResult } from "./DeleteManyResult.js";

describe("DeleteManyResult", () => {
    test("returns array of objects when returning clause is specified", () => {
        type Result = DeleteManyResult<
            Models,
            Operators,
            "post",
            { where: { id: 1 }; returning: ["id", "title", "content"] }
        >;

        expectTypeOf<Result>().toEqualTypeOf<
            { id: number; title: string; content: string }[]
        >();
    });

    test("returns number when no returning clause specified", () => {
        type Result = DeleteManyResult<
            Models,
            Operators,
            "post",
            { where: { id: 1 } }
        >;

        expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    test("handles nullable fields in returning clause", () => {
        type Result = DeleteManyResult<
            Models,
            Operators,
            "post",
            { where: { id: 1 }; returning: ["deletedAt"] }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{ deletedAt: Date | null }[]>();
    });

    test("handles array fields in returning clause", () => {
        type Result = DeleteManyResult<
            Models,
            Operators,
            "post",
            { where: { id: 1 }; returning: ["tags"] }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{ tags: string[] }[]>();
    });

    test("handles JSON fields in returning clause", () => {
        type Result = DeleteManyResult<
            Models,
            Operators,
            "post",
            { where: { id: 1 }; returning: ["metadata"] }
        >;

        expectTypeOf<Result>().toEqualTypeOf<
            {
                metadata: {
                    foo: "a" | "b" | "c";
                    bar: {
                        baz: "good" | "bad" | "indifferent";
                        quux: boolean;
                    }[];
                };
            }[]
        >();
    });

    test("returned objects only include fields specified in returning clause", () => {
        type Result = DeleteManyResult<
            Models,
            Operators,
            "post",
            { where: { id: 1 }; returning: ["id"] }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{ id: number }[]>();

        // @ts-expect-error - title is not included in returning clause
        expectTypeOf<Result>().toEqualTypeOf<{ id: number; title: string }[]>();
    });
});
