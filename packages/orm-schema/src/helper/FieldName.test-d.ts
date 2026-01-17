import { describe, expectTypeOf, test } from "vitest";

import { ModelDefinition } from "#definition/ModelDefinition.js";
import { FieldName } from "./FieldName.js";

describe("FieldName", () => {
    test("it evaluates to a string union of the model's column names", () => {
        const model = {
            fields: {
                id: { type: "serial" },
                name: { type: "text" },
                createdAt: { type: "timestamp" },
                dateOfBirth: { type: "date" },
                email: { type: "text" },
                type: { type: "text" },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<FieldName<typeof model>>().toEqualTypeOf<
            "id" | "name" | "createdAt" | "dateOfBirth" | "email" | "type"
        >();
    });
});
