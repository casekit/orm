import { describe, expectTypeOf, test } from "vitest";

import type { ModelDefinition } from "../definition/ModelDefinition.js";
import type { RequiredField } from "./RequiredField.js";

describe("RequiredField", () => {
    test("extracts fields that are required for insert", () => {
        const user = {
            fields: {
                id: { type: "serial", nullable: false },
                name: { type: "text", nullable: false },
                email: { type: "text", nullable: false },
                age: { type: "integer", nullable: false, default: 18 },
                role: { type: "text", nullable: false, provided: true },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<RequiredField<typeof user>>().toEqualTypeOf<
            "name" | "email"
        >();
    });

    test("returns never if all fields are optional", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text", nullable: true },
                age: { type: "integer", default: 18 },
                role: { type: "text", provided: true },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<RequiredField<typeof user>>().toEqualTypeOf<never>();
    });

    test("excludes fields with defaults, serial fields, nullable fields and provided fields", () => {
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

        expectTypeOf<RequiredField<typeof user>>().toEqualTypeOf<
            "name" | "score"
        >();
    });
});
