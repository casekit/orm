import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { CreateManyResult } from "./CreateManyResult.js";

describe("CreateManyResult", () => {
    test("returns array of objects when returning clause is specified", () => {
        type Result = CreateManyResult<
            Models,
            "post",
            {
                values: [{ title: string; content: string; authorId: number }];
                returning: ["id", "title", "createdAt"];
            }
        >;

        // Should return an array of objects with id (number), title (string), and createdAt (Date)
        expectTypeOf<Result>().toEqualTypeOf<
            { id: number; title: string; createdAt: Date }[]
        >();
    });

    test("returns number when no returning clause is specified", () => {
        type Result = CreateManyResult<
            Models,
            "post",
            { values: [{ title: string; content: string; authorId: number }] }
        >;
        expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    test("handles nullable fields in returning clause", () => {
        type Result = CreateManyResult<
            Models,
            "post",
            {
                values: [{ title: string; content: string; authorId: number }];
                returning: ["deletedAt"];
            }
        >;
        expectTypeOf<Result>().toEqualTypeOf<{ deletedAt: Date | null }[]>();
    });

    test("handles complex field types from model definition", () => {
        type Result = CreateManyResult<
            Models,
            "post",
            {
                values: [{ title: string; content: string; authorId: number }];
                returning: ["tags", "metadata"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<
            {
                tags: string[];
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

    test("returned object only includes fields specified in returning clause", () => {
        type Result = CreateManyResult<
            Models,
            "post",
            {
                values: [{ title: string; content: string; authorId: number }];
                returning: ["id"];
            }
        >;
        // Should only include id, not title or content
        expectTypeOf<Result>().toEqualTypeOf<{ id: number }[]>();

        // @ts-expect-error - title is not included in returning clause
        expectTypeOf<Result>().toEqualTypeOf<{ id: number; title: string }[]>();
    });
});
