import pg from "pg";
import * as uuid from "uuid";
import { assertType, describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import { ModelDefinition, orm } from "../../..";
import { db } from "../../../test/db";

describe("createOne", () => {
    test("only models that exist can be created", () => {
        assertType(
            db.createOne(
                // @ts-expect-error model does not exist
                "wrong",
                {},
            ),
        );
    });

    test("a data param must be included in the query", () => {
        assertType(
            db.createOne(
                "post",
                // @ts-expect-error data param is missing
                {},
            ),
        );
    });

    test("all required fields must be provided", () => {
        assertType(
            db.createOne("post", {
                // @ts-expect-error required fields not provided
                values: { title: "hello" },
            }),
        );
    });

    test("only existing fields can be included in the returning clause", () => {
        assertType(
            db.createOne("post", {
                values: {
                    title: "hello",
                    content: "it me",
                    authorId: uuid.v4(),
                },
                returning: [
                    "id",
                    // @ts-expect-error non-existing fields can't be returned
                    "x",
                ],
            }),
        );
    });

    test("without a returning clause, the return type is the number of rows created", async () => {
        expectTypeOf(
            await db.createOne("post", {
                values: {
                    title: "hello",
                    content: "it me",
                    authorId: uuid.v4(),
                },
            }),
        ).toMatchTypeOf<number>();
    });

    test("with a returning clause, the return type is an object containing the specified fields", async () => {
        expectTypeOf(
            await db.createOne("post", {
                values: {
                    title: "hello",
                    content: "it me",
                    authorId: uuid.v4(),
                },
                returning: ["id", "title"],
            }),
        ).toMatchTypeOf<{ id: string; title: string }>();
    });

    test("non-selected fields are not included in the result type", async () => {
        expectTypeOf(
            await db.createOne("post", {
                values: {
                    title: "hello",
                    content: "it me",
                    authorId: uuid.v4(),
                },
                returning: ["id", "title"],
            }),
        ).not.toMatchTypeOf<{ id: string; title: string; content: string }>();
    });

    test("when there are no required params, typechecking still works", () => {
        const foo = {
            columns: { id: { type: "serial", zodSchema: z.coerce.number() } },
        } satisfies ModelDefinition;
        const db = orm({ models: { foo }, pool: new pg.Pool() });
        assertType(db.createOne("foo", { values: { id: 3 } }));
    });

    test("when all required fields are provided, excess property checking still works", async () => {
        assertType(
            await db.createOne("post", {
                values: {
                    title: "hello",
                    content: "it me",
                    authorId: uuid.v4(),
                    // @ts-expect-error non-existing properties can't be included
                    wrong: 2,
                },
                returning: ["id", "title"],
            }),
        );
    });
});
