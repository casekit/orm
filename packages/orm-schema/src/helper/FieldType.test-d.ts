import { describe, expectTypeOf } from "vitest";
import { z } from "zod";

import type { ModelDefinition } from "#definition/ModelDefinition.js";
import type { FieldType } from "./FieldType.js";

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
        metadata: {
            type: "jsonb",
            default: "{}",
            zodSchema: z.object({
                foo: z.enum(["a", "b", "c"]),
                bar: z.array(
                    z.object({
                        baz: z.enum(["good", "bad", "indifferent"]),
                        quux: z.boolean(),
                    }),
                ),
            }),
        },
    },
} as const satisfies ModelDefinition;

type UserModel = typeof user;

describe("FieldType", () => {
    describe("json field", () => {
        expectTypeOf<FieldType<UserModel, "metadata">>().toEqualTypeOf<{
            foo: "a" | "b" | "c";
            bar: { baz: "good" | "bad" | "indifferent"; quux: boolean }[];
        }>();
    });

    describe("fields with Zod schemas", () => {
        expectTypeOf<FieldType<UserModel, "email">>().toBeString();

        expectTypeOf<FieldType<UserModel, "age">>().toBeNumber();

        expectTypeOf<FieldType<UserModel, "tags">>().toEqualTypeOf<string[]>();

        expectTypeOf<FieldType<UserModel, "status">>().toEqualTypeOf<
            "active" | "inactive" | "pending"
        >();

        expectTypeOf<
            FieldType<UserModel, "deletedAt">
        >().toEqualTypeOf<Date | null>();
    });

    describe("fields without Zod schemas (using DefaultFieldType)", () => {
        expectTypeOf<FieldType<UserModel, "id">>().toBeNumber();
        expectTypeOf<FieldType<UserModel, "createdAt">>().toEqualTypeOf<Date>();
    });
});
