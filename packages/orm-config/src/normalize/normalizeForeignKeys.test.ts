import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";

import { normalizeForeignKeys } from "./normalizeForeignKeys.js";
import { populateModels } from "./populateModels.js";

describe("normalizeForeignKeys", () => {
    test("normalizes foreign keys defined at the top level", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: {
                            type: "integer",
                            references: { model: "user", field: "id" },
                        },
                    },
                },
            },
        });

        expect(normalizeForeignKeys(models, models["post"]!)).toEqual([
            {
                name: "post_user_id_fkey",
                fields: ["userId"],
                columns: ["user_id"],
                references: {
                    model: "user",
                    fields: ["id"],
                    schema: "public",
                    table: "user",
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: null,
            },
        ]);
    });

    test("normalizes foreign keys defined in foreignKeys array", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: { type: "integer" },
                    },
                    foreignKeys: [
                        {
                            fields: ["userId"],
                            references: {
                                model: "user",
                                fields: ["id"],
                            },
                        },
                    ],
                },
            },
        });

        expect(normalizeForeignKeys(models, models["post"]!)).toEqual([
            {
                name: "post_user_id_fkey",
                fields: ["userId"],
                columns: ["user_id"],
                references: {
                    model: "user",
                    fields: ["id"],
                    schema: "public",
                    table: "user",
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: null,
            },
        ]);
    });

    test("throws error when referenced model doesn't exist", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: {
                            type: "integer",
                            references: { model: "nonexistent", field: "id" },
                        },
                    },
                },
            },
        });

        expect(() => normalizeForeignKeys(models, models["post"]!)).toThrow(
            'Referenced model "nonexistent" not found in models',
        );
    });

    test("respects custom onDelete and onUpdate actions", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: {
                            type: "integer",
                            references: {
                                model: "user",
                                field: "id",
                                onDelete: "CASCADE",
                                onUpdate: "SET NULL",
                            },
                        },
                    },
                },
            },
        });

        expect(normalizeForeignKeys(models, models["post"]!)).toEqual([
            {
                name: "post_user_id_fkey",
                fields: ["userId"],
                columns: ["user_id"],
                references: {
                    model: "user",
                    fields: ["id"],
                    schema: "public",
                    table: "user",
                    columns: ["id"],
                },
                onUpdate: "SET NULL",
                onDelete: "CASCADE",
            },
        ]);
    });

    test("throws error on duplicate foreign keys", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: {
                            type: "integer",
                            references: { model: "user", field: "id" },
                        },
                    },
                    foreignKeys: [
                        {
                            fields: ["userId"],
                            references: {
                                model: "user",
                                fields: ["id"],
                            },
                        },
                    ],
                },
            },
        });

        expect(() => normalizeForeignKeys(models, models["post"]!)).toThrow(
            'Duplicate foreign key defined in model "post"',
        );
    });

    test("handles custom foreign key names", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: { type: "integer" },
                    },
                    foreignKeys: [
                        {
                            name: "custom_fk_name",
                            fields: ["userId"],
                            references: {
                                model: "user",
                                fields: ["id"],
                            },
                        },
                    ],
                },
            },
        });

        expect(normalizeForeignKeys(models, models["post"]!)).toEqual([
            {
                name: "custom_fk_name",
                fields: ["userId"],
                columns: ["user_id"],
                references: {
                    model: "user",
                    fields: ["id"],
                    schema: "public",
                    table: "user",
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: null,
            },
        ]);
    });

    test("handles foreign keys in custom schema", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    schema: "auth",
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        userId: {
                            type: "integer",
                            references: { model: "user", field: "id" },
                        },
                    },
                },
            },
        });

        expect(normalizeForeignKeys(models, models["post"]!)).toEqual([
            {
                name: "post_user_id_fkey",
                fields: ["userId"],
                columns: ["user_id"],
                references: {
                    model: "user",
                    fields: ["id"],
                    schema: "auth",
                    table: "user",
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: null,
            },
        ]);
    });
});
