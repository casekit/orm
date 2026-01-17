import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";
import { ZodType } from "zod";

import { populateModels } from "./populateModels.js";

describe("populateModels", () => {
    test("populates basic models with defaults", () => {
        const result = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        name: { type: "text" },
                    },
                },
            },
        });

        expect(result).toEqual({
            user: {
                name: "user",
                schema: "public",
                table: "user",
                primaryKey: null,
                uniqueConstraints: [],
                foreignKeys: [],
                relations: {},
                fields: {
                    id: {
                        name: "id",
                        column: "id",
                        type: "serial",
                        zodSchema: expect.any(ZodType),
                        default: null,
                        references: null,
                        nullable: false,
                        unique: false,
                        primaryKey: true,
                        provided: false,
                    },
                    name: {
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
                    },
                },
            },
        });
    });

    test("uses config schema when model schema not provided", () => {
        const result = populateModels({
            schema: "custom",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(result["user"]!.schema).toBe("custom");
    });

    test("model schema overrides config schema", () => {
        const result = populateModels({
            schema: "config_schema",
            models: {
                user: {
                    schema: "model_schema",
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(result["user"]!.schema).toBe("model_schema");
    });

    test("applies table naming function when provided", () => {
        const result = populateModels({
            naming: { table: snakeCase },
            models: {
                userProfile: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(result["userProfile"]!.table).toBe("user_profile");
    });

    test("explicit table name overrides naming function", () => {
        const result = populateModels({
            naming: { table: snakeCase },
            models: {
                userProfile: {
                    table: "custom_table",
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(result["userProfile"]!.table).toBe("custom_table");
    });

    test("uses explicit primary key when provided", () => {
        const result = populateModels({
            models: {
                post: {
                    primaryKey: ["authorId", "slug"],
                    fields: {
                        authorId: { type: "integer" },
                        slug: { type: "text" },
                        content: { type: "text" },
                    },
                },
            },
        });

        expect(result["post"]!.primaryKey).toEqual(["authorId", "slug"]);
    });

    test("handles unique constraints", () => {
        const result = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text" },
                    },
                    uniqueConstraints: [
                        {
                            name: "unique_email",
                            fields: ["email"],
                        },
                    ],
                },
            },
        });

        expect(result["user"]!.uniqueConstraints).toEqual([
            {
                name: "unique_email",
                fields: ["email"],
            },
        ]);
    });

    test("handles foreign keys", () => {
        const result = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                    foreignKeys: [
                        {
                            fields: ["authorId"],
                            references: {
                                model: "user",
                                fields: ["id"],
                            },
                        },
                    ],
                },
            },
        });

        expect(result["post"]!.foreignKeys).toEqual([
            {
                fields: ["authorId"],
                references: {
                    model: "user",
                    fields: ["id"],
                },
            },
        ]);
    });

    test("handles relations", () => {
        const result = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                    relations: {
                        posts: {
                            type: "1:N",
                            model: "post",
                            fromField: "id",
                            toField: "authorId",
                        },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        authorId: { type: "integer" },
                    },
                },
            },
        });

        expect(result["user"]!.relations).toEqual({
            posts: {
                type: "1:N",
                model: "post",
                fromField: "id",
                toField: "authorId",
            },
        });
    });

    test("handles multiple models", () => {
        const result = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                comment: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(Object.keys(result)).toEqual(["user", "post", "comment"]);
        expect(result["user"]!.name).toBe("user");
        expect(result["post"]!.name).toBe("post");
        expect(result["comment"]!.name).toBe("comment");
    });
});
