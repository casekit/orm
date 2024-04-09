import { assertType, describe, expectTypeOf, test } from "vitest";

import { db } from "../../../test/db";

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
                select: ["id", "title", "content", "publishedAt"],
            }),
        ).toMatchTypeOf<
            {
                id: string;
                title: string;
                content: string;
                publishedAt: Date | null;
            }[]
        >();
    });

    test("non-selected fields are not included in the result type", async () => {
        expectTypeOf(
            await db.findMany("post", {
                select: ["id", "title"],
            }),
        ).not.toMatchTypeOf<{ id: number; title: string; content: string }[]>();
    });

    test("a model's relations can be included", async () => {
        expectTypeOf(
            await db.findMany("post", {
                select: ["id", "title", "content"],
                include: {
                    author: {
                        select: ["id", "username", "joinedAt"],
                        include: {
                            tenants: {
                                select: ["id", "name"],
                            },
                        },
                    },
                },
            }),
        ).toMatchTypeOf<
            Readonly<
                {
                    id: string;
                    title: string;
                    content: string;
                    author: {
                        id: string;
                        username: string;
                        joinedAt: Date | null;
                        tenants: { id: string; name: string }[];
                    };
                }[]
            >
        >();
    });

    test("only fields that exist can be selected from included models", async () => {
        assertType(
            await db.findMany("post", {
                select: ["id", "title", "content"],
                include: {
                    author: {
                        // @ts-expect-error wrong is not a field on the user model
                        select: ["id", "username", "joinedAt", "wrong"],
                        include: {
                            tenants: {
                                select: ["id", "name"],
                            },
                        },
                    },
                },
            }),
        );
    });
});
