import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";
import { ZodType, z } from "zod";

import { sql } from "@casekit/sql";

import { normalizeModel } from "./normalizeModel.js";
import { populateModels } from "./populateModels.js";

describe("normalizeModel", () => {
    test("normalizes complete model definition", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    schema: "auth",
                    fields: {
                        id: {
                            type: "serial",
                            primaryKey: true,
                        },
                        email: {
                            type: "text",
                            unique: true,
                            zodSchema: z.email(),
                        },
                        name: {
                            type: "text",
                            nullable: true,
                        },
                        createdAt: {
                            type: "timestamp",
                            default: sql`NOW()`,
                            provided: true,
                        },
                    },
                    relations: {
                        posts: {
                            type: "1:N",
                            model: "post",
                            fromField: "id",
                            toField: "authorId",
                        },
                        likedPosts: {
                            type: "N:N",
                            model: "post",
                            through: {
                                model: "like",
                                fromRelation: "user",
                                toRelation: "post",
                            },
                        },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        authorId: { type: "integer" },
                    },
                },
                like: {
                    fields: {
                        userId: { type: "integer" },
                        postId: { type: "integer" },
                    },
                },
            },
        });

        const result = normalizeModel(models, models["user"]!);

        // Test basic model properties
        expect(result.name).toBe("user");
        expect(result.schema).toBe("auth");
        expect(result.table).toBe("user");

        // Test fields
        expect(result.fields["id"]!).toEqual({
            name: "id",
            column: "id",
            type: "serial",
            zodSchema: expect.any(ZodType),
            nullable: false,
            default: null,
            provided: false,
        });

        expect(result.fields["email"]!).toEqual({
            name: "email",
            column: "email",
            type: "text",
            zodSchema: expect.any(ZodType),
            nullable: false,
            default: null,
            provided: false,
        });

        // Test primary key
        expect(result.primaryKey).toEqual([{ field: "id", column: "id" }]);

        // Test unique constraints
        expect(result.uniqueConstraints).toEqual([
            {
                name: "user_email_ukey",
                fields: ["email"],
                columns: ["email"],
                where: null,
                nullsNotDistinct: false,
            },
        ]);

        // Test relations
        expect(result.relations["posts"]!).toEqual({
            name: "posts",
            type: "1:N",
            model: "post",
            table: "post",
            from: {
                fields: ["id"],
                columns: ["id"],
            },
            to: {
                fields: ["authorId"],
                columns: ["author_id"],
            },
        });

        expect(result.relations["likedPosts"]!).toEqual({
            name: "likedPosts",
            type: "N:N",
            model: "post",
            table: "post",
            through: {
                model: "like",
                table: "like",
                fromRelation: "user",
                toRelation: "post",
            },
        });
    });

    test("normalizes model with column name transformations", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                userProfile: {
                    fields: {
                        userId: { type: "integer", primaryKey: true },
                        firstName: { type: "text" },
                        lastName: { type: "text" },
                        emailAddress: { type: "text", unique: true },
                    },
                },
            },
        });

        const result = normalizeModel(models, models["userProfile"]!);

        expect(result.fields["firstName"]!.column).toBe("first_name");
        expect(result.fields["lastName"]!.column).toBe("last_name");
        expect(result.fields["emailAddress"]!.column).toBe("email_address");

        expect(result.uniqueConstraints[0]!.columns).toEqual(["email_address"]);
    });

    test("normalizes model with custom schema and table names", () => {
        const models = populateModels({
            models: {
                user: {
                    schema: "custom_schema",
                    table: "custom_table",
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        const result = normalizeModel(models, models["user"]!);

        expect(result.schema).toBe("custom_schema");
        expect(result.table).toBe("custom_table");
    });

    test("normalizes model with composite primary key", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                orderLine: {
                    fields: {
                        orderId: { type: "integer" },
                        lineNumber: { type: "integer" },
                    },
                    primaryKey: ["orderId", "lineNumber"],
                },
            },
        });

        const result = normalizeModel(models, models["orderLine"]!);

        expect(result.primaryKey).toEqual([
            { field: "orderId", column: "order_id" },
            { field: "lineNumber", column: "line_number" },
        ]);
    });

    test("normalizes model with foreign keys", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                order: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        customerId: {
                            type: "integer",
                            references: {
                                model: "customer",
                                field: "id",
                                onDelete: "CASCADE",
                            },
                        },
                    },
                },
                customer: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        const result = normalizeModel(models, models["order"]!);

        expect(result.foreignKeys).toEqual([
            {
                name: "order_customer_id_fkey",
                fields: ["customerId"],
                columns: ["customer_id"],
                references: {
                    model: "customer",
                    fields: ["id"],
                    schema: "public",
                    table: "customer",
                    columns: ["id"],
                },
                onUpdate: null,
                onDelete: "CASCADE",
            },
        ]);
    });
});
