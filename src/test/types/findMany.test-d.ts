import { assertType, describe, expectTypeOf, test } from "vitest";
import { db } from "~/test/fixtures";

describe("findMany", () => {
    test("only models that exist can be queried", () => {
        assertType(
            db.findMany(
                // @ts-expect-error model does not exist
                "wrong",
                {},
            ),
        );
    });

    test("a select clause must be included in the query", () => {
        assertType(
            db.findMany(
                "post",
                // @ts-expect-error query is empty
                {},
            ),
        );
    });

    test("at least one field must be selected", () => {
        assertType(
            db.findMany("post", {
                // @ts-expect-error select clause is empty
                select: [],
            }),
        );
    });

    test("only fields on the model can be selected", () => {
        assertType(
            db.findMany("post", {
                // @ts-expect-error name is not a field on the post model
                select: ["id", "name", "content"],
            }),
        );
    });

    test("the return type is an array of objects including the selected fields", async () => {
        expectTypeOf(
            await db.findMany("post", {
                select: ["id", "title", "content"],
            }),
        ).toMatchTypeOf<{ id: string; title: string; content: string }[]>();
    });

    test("non-selected fields are not included in the result type", async () => {
        expectTypeOf(
            await db.findMany("post", {
                select: ["id", "title"],
            }),
        ).not.toMatchTypeOf<{ id: number; title: string; content: string }[]>();
    });
});
