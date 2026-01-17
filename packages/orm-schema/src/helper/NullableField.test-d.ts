import { describe, expectTypeOf, test } from "vitest";

import type { ModelDefinition } from "../definition/ModelDefinition.js";
import type { NullableField } from "./NullableField.js";

describe("NullableField", () => {
    test("extracts just the nullable fields from the model", () => {
        const user = {
            fields: {
                id: { type: "serial", nullable: false },
                name: { type: "text", nullable: true },
                email: { type: "text", nullable: true },
                age: { type: "integer", nullable: false },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<NullableField<typeof user>>().toEqualTypeOf<
            "name" | "email"
        >();
    });

    test("returns never if there are no nullable fields", () => {
        const user = {
            fields: {
                id: { type: "serial", nullable: false },
                name: { type: "text", nullable: false },
                age: { type: "integer", nullable: false },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<NullableField<typeof user>>().toEqualTypeOf<never>();
    });

    test("treats fields without nullable property as non-nullable", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text", nullable: true },
                age: { type: "integer" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<NullableField<typeof user>>().toEqualTypeOf<"name">();
    });
});
