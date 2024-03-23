import { assertType, describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { createModel, orm } from "../..";
import { db } from "../fixtures";

describe("create", () => {
    test("only models that exist can be created", () => {
        assertType(
            db.create(
                // @ts-expect-error model does not exist
                "wrong",
                {},
            ),
        );
    });

    test("a data param must be included in the query", () => {
        assertType(
            db.create(
                "post",
                // @ts-expect-error data param is missing
                {},
            ),
        );
    });

    test("all required fields must be provided", () => {
        assertType(
            db.create("post", {
                // @ts-expect-error required fields not provided
                data: { title: "hello" },
            }),
        );
    });

    test("only existing fields can be included in the returning clause", () => {
        assertType(
            db.create("post", {
                data: { title: "hello", content: "it me" },
                returning: [
                    "id",
                    // @ts-expect-error non-existing fields can't be returned
                    "x",
                ],
            }),
        );
    });

    test("without a returning clause, the return type is a boolean indicating success", async () => {
        expectTypeOf(
            await db.create("post", {
                data: { title: "hello", content: "it me" },
            }),
        ).toMatchTypeOf<boolean>();
    });

    test("with a returning clause, the return type is an object containing the specified fields", async () => {
        expectTypeOf(
            await db.create("post", {
                data: { title: "hello", content: "it me" },
                returning: ["id", "title"],
            }),
        ).toMatchTypeOf<{ id: string; title: string }>();
    });

    test("non-selected fields are not included in the result type", async () => {
        expectTypeOf(
            await db.create("post", {
                data: { title: "hello", content: "it me" },
                returning: ["id", "title"],
            }),
        ).not.toMatchTypeOf<{ id: string; title: string; content: string }>();
    });

    test("when there are no required params, typechecking still works", () => {
        const foo = createModel({
            columns: { id: { type: "serial", schema: z.coerce.number() } },
        });
        const db = orm({ models: { foo } });
        assertType(db.create("foo", { data: { id: 3 } }));
    });
});
