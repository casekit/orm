import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { CreateOneResult } from "./CreateOneResult.js";

describe("CreateOneResult", () => {
    test("returns object with fields when returning clause specified", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
                returning: ["id", "title", "createdAt"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{
            id: number;
            title: string;
            createdAt: Date;
        }>();
    });

    test("returns number when no returning clause specified", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<number>();
    });

    test("handles nullable fields in returning clause", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
                returning: ["deletedAt"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{
            deletedAt: Date | null;
        }>();
    });

    test("handles array fields in returning clause", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
                returning: ["tags"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{
            tags: string[];
        }>();
    });

    test("handles json fields in returning clause", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
                onConflict: { do: "nothing" };
                returning: ["metadata"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{
            metadata: {
                foo: "a" | "b" | "c";
                bar: { baz: "good" | "bad" | "indifferent"; quux: boolean }[];
            };
        } | null>();
    });

    test("returned object only includes fields specified in returning clause", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
                returning: ["id"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{ id: number }>();

        // @ts-expect-error - title is not included in returning clause
        expectTypeOf<Result>().toEqualTypeOf<{ id: number; title: string }>();
    });

    test("is nullable if onConflict is set to do nothing", () => {
        type Result = CreateOneResult<
            Models,
            "post",
            {
                values: {
                    title: string;
                    content: string;
                    authorId: number;
                };
                onConflict: { do: "nothing" };
                returning: ["metadata"];
            }
        >;

        expectTypeOf<Result>().toEqualTypeOf<{
            metadata: {
                foo: "a" | "b" | "c";
                bar: { baz: "good" | "bad" | "indifferent"; quux: boolean }[];
            };
        } | null>();
    });
});
