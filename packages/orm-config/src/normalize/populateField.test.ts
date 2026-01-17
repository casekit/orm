import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";
import { ZodType, z } from "zod";

import { populateField } from "./populateField.js";

describe("populateField", () => {
    test("populates minimal field definition with defaults", () => {
        const result = populateField(
            {
                models: {
                    user: {
                        fields: {
                            name: { type: "text" },
                        },
                    },
                },
            },
            { type: "text" },
            "name",
        );

        expect(result).toEqual({
            name: "name",
            column: "name",
            type: "text",
            zodSchema: expect.any(ZodType),
            default: null,
            references: null,
            nullable: false,
            unique: false,
            primaryKey: false,
            provided: false,
        });
    });

    test("applies naming function to column name when provided", () => {
        const result = populateField(
            {
                naming: { column: snakeCase },
                models: {
                    user: {
                        fields: {
                            fullName: { type: "text" },
                        },
                    },
                },
            },
            { type: "text" },
            "fullName",
        );

        expect(result.column).toBe("full_name");
    });

    test("uses explicit column name over naming function", () => {
        const result = populateField(
            {
                naming: { column: snakeCase },
                models: {
                    user: {
                        fields: {
                            fullName: { type: "text", column: "explicit_name" },
                        },
                    },
                },
            },
            { type: "text", column: "explicit_name" },
            "fullName",
        );

        expect(result.column).toBe("explicit_name");
    });

    test("preserves custom zodSchema", () => {
        const customSchema = z.email();
        const result = populateField(
            {
                models: {
                    user: {
                        fields: {
                            email: { type: "text", zodSchema: customSchema },
                        },
                    },
                },
            },
            { type: "text", zodSchema: customSchema },
            "email",
        );

        expect(result.zodSchema).toEqual(customSchema);
    });

    test("preserves all provided values", () => {
        const result = populateField(
            {
                models: {
                    user: {
                        fields: {
                            id: {
                                type: "integer",
                                column: "custom_id",
                                zodSchema: z.number().min(1),
                                default: 42,
                                references: { model: "other", field: "id" },
                                nullable: true,
                                unique: true,
                                primaryKey: true,
                                provided: true,
                            },
                        },
                    },
                    other: {
                        fields: {
                            id: { type: "serial", primaryKey: true },
                        },
                    },
                },
            },
            {
                type: "integer",
                column: "custom_id",
                zodSchema: z.number().min(1),
                default: 42,
                references: { model: "other", field: "id" },
                nullable: true,
                unique: true,
                primaryKey: true,
                provided: true,
            },
            "id",
        );

        expect(result).toEqual({
            name: "id",
            type: "integer",
            column: "custom_id",
            zodSchema: expect.any(ZodType),
            default: 42,
            references: { model: "other", field: "id" },
            nullable: true,
            unique: true,
            primaryKey: true,
            provided: true,
        });
    });

    test("handles array types", () => {
        const result = populateField(
            {
                models: {
                    post: {
                        fields: {
                            tags: { type: "text[]" },
                        },
                    },
                },
            },
            { type: "text[]" },
            "tags",
        );

        expect(result).toEqual({
            name: "tags",
            column: "tags",
            type: "text[]",
            zodSchema: expect.any(ZodType),
            default: null,
            references: null,
            nullable: false,
            unique: false,
            primaryKey: false,
            provided: false,
        });
    });

    test("handles nullable fields", () => {
        const result = populateField(
            {
                models: {
                    post: {
                        fields: {
                            description: { type: "text", nullable: true },
                        },
                    },
                },
            },
            { type: "text", nullable: true },
            "description",
        );

        expect(result.nullable).toBe(true);
    });

    test("handles fields with defaults", () => {
        const result = populateField(
            {
                models: {
                    user: {
                        fields: {
                            active: { type: "boolean", default: false },
                        },
                    },
                },
            },
            { type: "boolean", default: false },
            "active",
        );

        expect(result.default).toBe(false);
    });

    test("handles fields with foreign keys", () => {
        const result = populateField(
            {
                models: {
                    user: {
                        fields: {
                            id: { type: "serial", primaryKey: true },
                        },
                    },
                    post: {
                        fields: {
                            userId: {
                                type: "integer",
                                references: {
                                    model: "user",
                                    field: "id",
                                    onDelete: "CASCADE",
                                },
                            },
                        },
                    },
                },
            },
            {
                type: "integer",
                references: {
                    model: "user",
                    field: "id",
                    onDelete: "CASCADE",
                },
            },
            "userId",
        );

        expect(result.references).toEqual({
            model: "user",
            field: "id",
            onDelete: "CASCADE",
        });
    });
});
