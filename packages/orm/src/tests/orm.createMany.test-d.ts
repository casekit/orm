import { DeepReadonly } from "ts-essentials";
import { assertType, describe, expectTypeOf, test } from "vitest";

import { models } from "@casekit/orm-fixtures";

import { orm } from "../orm.js";

const db = orm({ models });

describe("createMany types", () => {
    test("values is required", () => {
        assertType(
            db.createMany(
                "post",
                // @ts-expect-error - values is required
                {},
            ),
        );
    });

    test("values must match model fields", () => {
        assertType(
            db.createMany("post", {
                values: [
                    {
                        // @ts-expect-error - wrong is not a column
                        wrong: "value",
                    },
                ],
            }),
        );
    });

    test("returning fields must exist on model", () => {
        assertType(
            db.createMany("post", {
                values: [
                    {
                        title: "test",
                        content: "content",
                        authorId: 123,
                    },
                ],
                returning: [
                    // @ts-expect-error - wrong is not a column
                    "wrong",
                ],
            }),
        );
    });

    test("missing required fields", () => {
        assertType(
            db.createMany("post", {
                values: [
                    // @ts-expect-error - missing required fields
                    {
                        title: "test",
                    },
                ],
            }),
        );
    });

    test("valid create params with returning clause", async () => {
        expectTypeOf(
            await db.createMany("post", {
                values: [
                    {
                        title: "test",
                        content: "content",
                        authorId: 123,
                    },
                ],
                returning: ["id", "title"],
                onConflict: {
                    do: "nothing",
                },
            }),
        ).toEqualTypeOf<DeepReadonly<{ id: number; title: string }[]>>();
    });

    test("valid create params without returning clause", async () => {
        expectTypeOf(
            await db.createMany("user", {
                values: [
                    {
                        name: "test",
                        email: "test@example.com",
                        role: "user",
                    },
                ],
                onConflict: {
                    do: "nothing",
                },
            }),
        ).toEqualTypeOf<DeepReadonly<number>>();
    });

    test("works with enum fields", async () => {
        expectTypeOf(
            await db.createMany("user", {
                values: [
                    {
                        name: "test",
                        email: "test@example.com",
                        role: "user",
                    },
                ],
                returning: ["id"],
            }),
        ).toEqualTypeOf<DeepReadonly<{ id: number }[]>>();
    });

    test("enum fields are returned as enum types", async () => {
        expectTypeOf(
            await db.createMany("user", {
                values: [
                    {
                        name: "test",
                        email: "test@example.com",
                        role: "user",
                    },
                ],
                returning: ["id", "role", "deletedAt"],
            }),
        ).toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                    role: "user" | "admin";
                    deletedAt: Date | null;
                }[]
            >
        >();
    });

    test("handles array fields", async () => {
        expectTypeOf(
            await db.createMany("post", {
                values: [
                    {
                        title: "test",
                        content: "test content",
                        authorId: 123,
                        tags: ["test", "example"],
                    },
                ],
                returning: ["id", "tags"],
            }),
        ).toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                    tags: string[];
                }[]
            >
        >();
    });

    test("handles json fields", async () => {
        expectTypeOf(
            await db.createMany("post", {
                values: [
                    {
                        title: "test",
                        content: "test content",
                        authorId: 123,
                        metadata: {
                            foo: "b",
                            bar: [
                                { baz: "good", quux: true },
                                { baz: "bad", quux: false },
                            ],
                        },
                    },
                ],
                returning: ["id", "metadata"],
            }),
        ).toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                    metadata: {
                        foo: "a" | "b" | "c";
                        bar: {
                            baz: "good" | "bad" | "indifferent";
                            quux: boolean;
                        }[];
                    };
                }[]
            >
        >();
    });
});
