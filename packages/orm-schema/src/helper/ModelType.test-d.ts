import { describe, expectTypeOf } from "vitest";
import { z } from "zod";

import type { ModelDefinition } from "#definition/ModelDefinition.js";
import { ModelType } from "./ModelType.js";

const user = {
    fields: {
        email: {
            type: "text",
            zodSchema: z.email(),
        },
        id: {
            type: "serial",
        },
        age: {
            type: "integer",
            zodSchema: z.number().min(0).max(150),
        },
        tags: {
            type: "text[]",
            zodSchema: z.array(z.string()),
        },
        status: {
            type: "text",
            zodSchema: z.enum(["active", "inactive", "pending"]),
        },
        createdAt: {
            type: "timestamp with time zone",
        },
        deletedAt: {
            type: "timestamp with time zone",
            zodSchema: z.date().nullable(),
        },
    },
} as const satisfies ModelDefinition;

describe("ModelType", () => {
    describe("Evaluate to a type containing all the fields of the", () => {
        expectTypeOf<ModelType<typeof user>>().toEqualTypeOf<
            Readonly<{
                email: string;
                id: number;
                age: number;
                tags: string[];
                status: "active" | "inactive" | "pending";
                createdAt: Date;
                deletedAt: Date | null;
            }>
        >();
    });
});
