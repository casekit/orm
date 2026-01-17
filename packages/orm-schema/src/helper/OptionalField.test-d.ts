import { describe, expectTypeOf, test } from "vitest";

import type { ModelDefinition } from "../definition/ModelDefinition.js";
import type { OptionalField } from "./OptionalField.js";

describe("OptionalField", () => {
    test("extracts fields that are optional for insert", () => {
        const user = {
            fields: {
                id: { type: "serial", nullable: false },
                name: { type: "text", nullable: false },
                email: { type: "text", nullable: false },
                age: { type: "integer", nullable: false, default: 18 },
                role: { type: "text", nullable: false, provided: true },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<OptionalField<typeof user>>().toEqualTypeOf<
            "id" | "age" | "role"
        >();
    });

    test("returns all fields if none are required", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text", nullable: true },
                age: { type: "integer", default: 18 },
                role: { type: "text", provided: true },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<OptionalField<typeof user>>().toEqualTypeOf<
            "id" | "name" | "age" | "role"
        >();
    });

    test("includes fields with defaults, serial fields, nullable fields and provided fields", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text", nullable: false },
                email: { type: "text", nullable: true },
                age: { type: "integer", default: 18 },
                role: { type: "text", provided: true },
                score: { type: "integer", nullable: false },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<OptionalField<typeof user>>().toEqualTypeOf<
            "id" | "email" | "age" | "role"
        >();
    });
});
