import { describe, expectTypeOf, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { OptionalValues } from "./OptionalValues.js";

describe("OptionalValues", () => {
    test("extracts optional fields from model", () => {
        expectTypeOf<OptionalValues<Models["post"]>>().toEqualTypeOf<{
            // serial
            id?: number | null;
            // has default value
            tags?: string[] | null;
            createdAt?: Date | null;
            // nullable
            publishedAt?: Date | null;
            deletedAt?: Date | null;
            backgroundColorValue?: string | null;
            // jsonb with zod schema
            metadata?: {
                foo: "a" | "b" | "c";
                bar: { baz: "good" | "bad" | "indifferent"; quux: boolean }[];
            } | null;
        }>();
    });

    test("returns never for models with no optional fields", () => {
        expectTypeOf<OptionalValues<Models["color"]>>().toEqualTypeOf<never>();
    });

    test("works for models with no required fields", () => {
        expectTypeOf<OptionalValues<Models["counter"]>>().toEqualTypeOf<{
            counter?: number | null;
        }>();
    });
});
