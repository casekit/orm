import { describe, expectTypeOf, test } from "vitest";

import type { ModelDefinition } from "../definition/ModelDefinition.js";
import type { SerialField } from "./SerialField.js";

describe("SerialField", () => {
    test("extracts just the fields with a SERIAL datatype from the model", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                smallId: { type: "smallserial" },
                bigId: { type: "bigserial" },
                name: { type: "text" },
                age: { type: "integer" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<SerialField<typeof user>>().toEqualTypeOf<
            "id" | "smallId" | "bigId"
        >();
    });

    test("works for both lower and uppercase field types", () => {
        const user = {
            fields: {
                id: { type: "SERIAL" },
                smallId: { type: "SMALLSERIAL" },
                bigId: { type: "BIGSERIAL" },
                name: { type: "TEXT" },
                age: { type: "INTEGER" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<SerialField<typeof user>>().toEqualTypeOf<
            "id" | "smallId" | "bigId"
        >();
    });

    test("returns never if there are no SERIAL fields", () => {
        const user = {
            fields: {
                name: { type: "text" },
                age: { type: "integer" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<SerialField<typeof user>>().toEqualTypeOf<never>();
    });

    test("does not include fields with a type that end with serial but isn't a serial type", () => {
        const user = {
            fields: {
                id: { type: "serial" },
                name: { type: "text" },
                age: { type: "integer" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<SerialField<typeof user>>().toEqualTypeOf<"id">();
    });
});
