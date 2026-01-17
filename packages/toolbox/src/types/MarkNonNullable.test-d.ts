import { describe, expectTypeOf, test } from "vitest";

import { MarkNonNullable } from "./MarkNonNullable.js";

interface User {
    id: number;
    name: string | null;
    email?: string;
    phone?: string | null;
    address: {
        street?: string;
        city: string | null;
    };
}

describe("MarkNonNullable", () => {
    test("should make specified properties non-nullable while preserving other properties", () => {
        type UserWithRequiredName = MarkNonNullable<User, "name">;

        // name should be string only (not null)
        expectTypeOf<UserWithRequiredName>().toExtend<{ name: string }>();

        // other properties should remain unchanged
        expectTypeOf<UserWithRequiredName["email"]>().toEqualTypeOf<
            string | undefined
        >();
        expectTypeOf<UserWithRequiredName["phone"]>().toEqualTypeOf<
            string | null | undefined
        >();
    });

    test("should handle multiple properties", () => {
        type UserWithRequiredFields = MarkNonNullable<User, "name" | "email">;

        expectTypeOf<UserWithRequiredFields>().toExtend<{
            name: string;
            email: string;
        }>();
    });

    test("should handle nested properties", () => {
        type UserWithRequiredAddress = MarkNonNullable<User, "address">;

        // The address object itself should remain the same structure
        expectTypeOf<UserWithRequiredAddress["address"]>().toEqualTypeOf<{
            street?: string;
            city: string | null;
        }>();
    });

    test("should preserve required properties", () => {
        type UserWithRequiredId = MarkNonNullable<User, "id">;

        // id was already required, should remain number
        expectTypeOf<UserWithRequiredId["id"]>().toEqualTypeOf<number>();
    });

    test("should handle optional properties", () => {
        type UserWithRequiredOptionals = MarkNonNullable<
            User,
            "email" | "phone"
        >;

        // Optional properties should become required and non-nullable
        expectTypeOf<UserWithRequiredOptionals>().toExtend<{
            email: string;
            phone: string;
        }>();
    });
});
