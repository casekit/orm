import { describe, expectTypeOf, test } from "vitest";

import type { ModelDefinition } from "../definition/ModelDefinition.js";
import type { ProvidedField } from "./ProvidedField.js";

describe("ProvidedField", () => {
    test("extracts just the provided fields from the model", () => {
        const user = {
            fields: {
                id: { type: "serial", provided: false },
                createdAt: { type: "timestamp", provided: true },
                updatedAt: { type: "timestamp", provided: true },
                name: { type: "text", provided: false },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<ProvidedField<typeof user>>().toEqualTypeOf<
            "createdAt" | "updatedAt"
        >();
    });

    test("returns never if there are no provided fields", () => {
        const user = {
            fields: {
                id: { type: "serial", provided: false },
                name: { type: "text", provided: false },
                age: { type: "integer", provided: false },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<ProvidedField<typeof user>>().toEqualTypeOf<never>();
    });

    test("treats fields without provided property as non-provided", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                createdAt: { type: "timestamp", provided: true },
                name: { type: "text" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<ProvidedField<typeof user>>().toEqualTypeOf<"createdAt">();
    });
});
