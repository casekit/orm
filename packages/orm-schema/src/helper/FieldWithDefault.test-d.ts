import { describe, expectTypeOf, test } from "vitest";

import type { ModelDefinition } from "../definition/ModelDefinition.js";
import type { FieldWithDefault } from "./FieldWithDefault.js";

describe("FieldWithDefault", () => {
    test("extracts just the fields with a default value from the model", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text", default: "Anonymous" },
                age: { type: "integer", default: 18 },
                email: { type: "text", default: null },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<FieldWithDefault<typeof user>>().toEqualTypeOf<
            "name" | "age"
        >();
    });

    test("returns never if there are no fields with defaults", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text" },
                age: { type: "integer" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<FieldWithDefault<typeof user>>().toEqualTypeOf<never>();
    });

    test("excludes fields with null or undefined defaults", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text", default: "Anonymous" },
                email: { type: "text", default: null },
                phone: { type: "text", default: undefined },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<FieldWithDefault<typeof user>>().toEqualTypeOf<"name">();
    });
});
