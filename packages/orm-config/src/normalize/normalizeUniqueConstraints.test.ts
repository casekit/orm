import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";

import { normalizeUniqueConstraints } from "./normalizeUniqueConstraints.js";
import { populateModels } from "./populateModels.js";

describe("normalizeUniqueConstraints", () => {
    test("handles both column-level and model-level unique constraints", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text", unique: true },
                        username: { type: "text" },
                    },
                    uniqueConstraints: [
                        {
                            fields: ["username"],
                        },
                    ],
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([
            {
                name: "user_email_ukey",
                fields: ["email"],
                columns: ["email"],
                where: null,
                nullsNotDistinct: false,
            },
            {
                name: "user_username_ukey",
                fields: ["username"],
                columns: ["username"],
                where: null,
                nullsNotDistinct: false,
            },
        ]);
    });

    test("handles complex column-level unique constraints", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: {
                            type: "text",
                            unique: {
                                where: sql`deleted_at IS NULL`,
                                nullsNotDistinct: true,
                            },
                        },
                    },
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([
            {
                name: "user_email_ukey",
                fields: ["email"],
                columns: ["email"],
                where: sql`deleted_at IS NULL`,
                nullsNotDistinct: true,
            },
        ]);
    });

    test("handles fields with unique: false", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text", unique: false },
                    },
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([]);
    });

    test("handles multiple model-level unique constraints", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        firstName: { type: "text" },
                        lastName: { type: "text" },
                        email: { type: "text" },
                    },
                    uniqueConstraints: [
                        {
                            fields: ["firstName", "lastName"],
                            nullsNotDistinct: true,
                        },
                        {
                            name: "unique_email",
                            fields: ["email"],
                            where: sql`deleted_at IS NULL`,
                        },
                    ],
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([
            {
                name: "user_first_name_last_name_ukey",
                fields: ["firstName", "lastName"],
                columns: ["first_name", "last_name"],
                where: null,
                nullsNotDistinct: true,
            },
            {
                name: "unique_email",
                fields: ["email"],
                columns: ["email"],
                where: sql`deleted_at IS NULL`,
                nullsNotDistinct: false,
            },
        ]);
    });

    test("handles custom column names", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: {
                            type: "text",
                            column: "user_email",
                            unique: true,
                        },
                    },
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([
            {
                name: "user_user_email_ukey",
                fields: ["email"],
                columns: ["user_email"],
                where: null,
                nullsNotDistinct: false,
            },
        ]);
    });

    test("returns empty array when no unique constraints exist", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text" },
                    },
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([]);
    });

    test("throws error for non-existent fields in model-level constraints", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                    uniqueConstraints: [
                        {
                            fields: ["nonexistent"],
                        },
                    ],
                },
            },
        });

        expect(() => normalizeUniqueConstraints(models["user"]!)).toThrow(
            'Field "nonexistent" not found in model "user"',
        );
    });

    test("handles mix of boolean and object unique constraints at column level", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text", unique: true },
                        username: {
                            type: "text",
                            unique: {
                                where: sql`active = true`,
                                nullsNotDistinct: true,
                            },
                        },
                    },
                },
            },
        });

        const result = normalizeUniqueConstraints(models["user"]!);

        expect(result).toEqual([
            {
                name: "user_email_ukey",
                fields: ["email"],
                columns: ["email"],
                where: null,
                nullsNotDistinct: false,
            },
            {
                name: "user_username_ukey",
                fields: ["username"],
                columns: ["username"],
                where: sql`active = true`,
                nullsNotDistinct: true,
            },
        ]);
    });

    test("throws error for duplicate unique constraints", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text", unique: true },
                    },
                    uniqueConstraints: [
                        {
                            fields: ["email"], // This duplicates the column-level unique constraint
                        },
                    ],
                },
            },
        });

        expect(() => normalizeUniqueConstraints(models["user"]!)).toThrow(
            'Duplicate unique constraint defined in model "user"',
        );
    });
});
