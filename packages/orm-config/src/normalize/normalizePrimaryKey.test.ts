import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";

import { normalizePrimaryKey } from "./normalizePrimaryKey.js";
import { populateModels } from "./populateModels.js";

describe("normalizePrimaryKey", () => {
    test("normalizes field-level primary key", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        name: { type: "text" },
                    },
                },
            },
        });

        const result = normalizePrimaryKey(models["user"]!);

        expect(result).toEqual([
            {
                field: "id",
                column: "id",
            },
        ]);
    });

    test("normalizes model-level primary key", () => {
        const models = populateModels({
            models: {
                userRole: {
                    primaryKey: ["userId", "roleId"],
                    fields: {
                        userId: { type: "integer" },
                        roleId: { type: "integer" },
                        assignedAt: { type: "timestamp" },
                    },
                },
            },
        });

        const result = normalizePrimaryKey(models["userRole"]!);

        expect(result).toEqual([
            {
                field: "userId",
                column: "userId",
            },
            {
                field: "roleId",
                column: "roleId",
            },
        ]);
    });

    test("throws error when primary key is defined at both levels", () => {
        const models = populateModels({
            models: {
                user: {
                    primaryKey: ["id"],
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        name: { type: "text" },
                    },
                },
            },
        });

        expect(() => normalizePrimaryKey(models["user"]!)).toThrow(
            'Model "user" has primary key fields defined at both the model and field levels.',
        );
    });

    test("handles column name transformations", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        userId: { type: "serial", primaryKey: true },
                        fullName: { type: "text" },
                    },
                },
            },
        });

        const result = normalizePrimaryKey(models["user"]!);

        expect(result).toEqual([
            {
                field: "userId",
                column: "user_id",
            },
        ]);
    });

    test("handles custom column names", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: {
                            type: "serial",
                            primaryKey: true,
                            column: "user_identifier",
                        },
                    },
                },
            },
        });

        const result = normalizePrimaryKey(models["user"]!);

        expect(result).toEqual([
            {
                field: "id",
                column: "user_identifier",
            },
        ]);
    });

    test("throws error for non-existent primary key field in model-level definition", () => {
        const models = populateModels({
            models: {
                user: {
                    primaryKey: ["nonexistent"],
                    fields: {
                        id: { type: "serial" },
                        name: { type: "text" },
                    },
                },
            },
        });

        expect(() => normalizePrimaryKey(models["user"]!)).toThrow(
            'Primary key field "nonexistent" does not exist in model "user".',
        );
    });

    test("handles multiple field-level primary keys", () => {
        const models = populateModels({
            models: {
                userRole: {
                    fields: {
                        userId: { type: "integer", primaryKey: true },
                        roleId: { type: "integer", primaryKey: true },
                        assignedAt: { type: "timestamp" },
                    },
                },
            },
        });

        const result = normalizePrimaryKey(models["userRole"]!);

        expect(result).toEqual([
            {
                field: "userId",
                column: "userId",
            },
            {
                field: "roleId",
                column: "roleId",
            },
        ]);
    });
});
