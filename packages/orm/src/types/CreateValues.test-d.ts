import { DeepReadonly } from "ts-essentials";
import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { CreateValues } from "./CreateValues.js";

describe("CreateValues", () => {
    test("combines required and optional fields for post model", () => {
        const _: CreateValues<Models["post"]> = {
            title: "Hello world",
            content: "My first post",
            tags: ["a", "b", "c"],
            metadata: {
                foo: "a",
                bar: [
                    { baz: "good", quux: true },
                    { baz: "bad", quux: false },
                ],
            },
            authorId: 1,
        };
    });

    test("enforces required fields", () => {
        // @ts-expect-error authorId is required
        const _: CreateValues<Models["post"]> = {
            title: "Hello",
            content: "World",
            metadata: { foo: "a", bar: [{ baz: "good", quux: true }] },
        };
    });

    test("allows omitting optional fields", () => {
        const values: CreateValues<Models["post"]> = {
            title: "Hello",
            content: "World",
            authorId: 1,
        };
        expectTypeOf(values).toEqualTypeOf<CreateValues<Models["post"]>>();
    });

    test("handles model with only required fields", () => {
        expectTypeOf<CreateValues<Models["color"]>>().toEqualTypeOf<
            DeepReadonly<{
                name: string;
                hex: string;
            }>
        >();
    });

    test("handles model with only optional fields", () => {
        expectTypeOf<CreateValues<Models["counter"]>>().toEqualTypeOf<
            DeepReadonly<{
                counter?: number | null;
            }>
        >();
    });

    test("nullable fields are optional but typed correctly", () => {
        const values: CreateValues<Models["post"]> = {
            title: "Hello",
            content: "World",
            authorId: 1,
            deletedAt: null,
        };
        expectTypeOf(values.deletedAt).toEqualTypeOf<Date | null | undefined>();
    });

    test("type error for invalid field value types", () => {
        const _: CreateValues<Models["post"]> = {
            title: "Hello",
            content: "World",
            authorId: 1,
            // @ts-expect-error tags must be string[]
            tags: "not-an-array",
            // @ts-expect-error publishedAt must be Date | null
            deletedAt: "not-a-date",
        };
    });
});
