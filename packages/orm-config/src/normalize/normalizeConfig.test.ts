import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { sql } from "@casekit/sql";

import { defaultLogger } from "./defaultLogger.js";
import { normalizeConfig } from "./normalizeConfig.js";

describe("normalizeConfig", () => {
    test("normalizes minimal config with defaults", () => {
        const config = {
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        name: { type: "text" },
                    },
                },
            },
        } as const;

        const result = normalizeConfig(config);

        expect(result.schema).toBe("public");
        expect(result.operators).toEqual({ where: {} });
        expect(result.extensions).toEqual([]);
        expect(result.connection).toBeNull();
        expect(result.pool).toBe(true);
        expect(result.logger).toBe(defaultLogger);
        expect(typeof result.naming.column).toBe("function");
        expect(typeof result.naming.table).toBe("function");

        // Test that default identity functions don't transform names
        expect(result.naming.column("userName")).toBe("userName");
        expect(result.naming.table("UserProfile")).toBe("UserProfile");
    });

    test("preserves provided config values", () => {
        const customLogger = {
            debug: () => {
                /* empty */
            },
            info: () => {
                /* empty  */
            },
            warn: () => {
                /* empty */
            },
            error: () => {
                /* empty */
            },
        };

        const $contains = Symbol("contains");

        const config = {
            schema: "custom",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
            operators: {
                where: {
                    [$contains]: () => sql``,
                },
            },
            extensions: ["uuid-ossp"],
            connection: {
                host: "localhost",
                database: "test",
            },
            pool: true,
            logger: customLogger,
            naming: {
                column: snakeCase,
                table: snakeCase,
            },
        } as const;

        const result = normalizeConfig(config);

        expect(result.schema).toBe("custom");
        expect(result.operators).toBe(config.operators);
        expect(result.extensions).toEqual(["uuid-ossp"]);
        expect(result.connection).toBe(config.connection);
        expect(result.pool).toBe(true);
        expect(result.logger).toBe(customLogger);
        expect(result.naming.column).toBe(snakeCase);
        expect(result.naming.table).toBe(snakeCase);
    });

    test("normalizes models with relationships", () => {
        const config = {
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text", unique: true },
                    },
                    relations: {
                        posts: {
                            type: "1:N" as const,
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
        } as const;

        const result = normalizeConfig(config);

        expect(result.models["user"]!.relations["posts"]!).toEqual({
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
                columns: ["authorId"],
            },
        });
    });

    test("applies naming functions to all models", () => {
        const config = {
            naming: {
                column: snakeCase,
                table: snakeCase,
            },
            models: {
                userProfile: {
                    fields: {
                        userId: { type: "serial", primaryKey: true },
                        firstName: { type: "text" },
                        lastName: { type: "text" },
                    },
                },
                orderItem: {
                    fields: {
                        orderId: { type: "integer" },
                        productId: { type: "integer" },
                        unitPrice: { type: "numeric" },
                    },
                },
            },
        } as const;

        const result = normalizeConfig(config);

        // Check table names
        expect(result.models["userProfile"]!.table).toBe("user_profile");
        expect(result.models["orderItem"]!.table).toBe("order_item");

        // Check column names in first model
        expect(result.models["userProfile"]!.fields["userId"]!.column).toBe(
            "user_id",
        );
        expect(result.models["userProfile"]!.fields["firstName"]!.column).toBe(
            "first_name",
        );
        expect(result.models["userProfile"]!.fields["lastName"]!.column).toBe(
            "last_name",
        );

        // Check column names in second model
        expect(result.models["orderItem"]!.fields["orderId"]!.column).toBe(
            "order_id",
        );
        expect(result.models["orderItem"]!.fields["productId"]!.column).toBe(
            "product_id",
        );
        expect(result.models["orderItem"]!.fields["unitPrice"]!.column).toBe(
            "unit_price",
        );
    });

    test("normalizes custom Zod schemas in models", () => {
        const config = {
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: {
                            type: "text",
                            zodSchema: z.email(),
                        },
                        age: {
                            type: "integer",
                            zodSchema: z.number().min(0).max(150),
                        },
                    },
                },
            },
        } as const;

        const result = normalizeConfig(config);

        // Verify that Zod schemas are preserved
        expect(
            result.models["user"]!.fields["email"]!.zodSchema,
        ).toBeInstanceOf(z.ZodEmail);
        expect(result.models["user"]!.fields["age"]!.zodSchema).toBeInstanceOf(
            z.ZodNumber,
        );
    });

    test("handles partial naming configuration", () => {
        const config = {
            naming: {
                column: snakeCase,
                // table naming function omitted
            },
            models: {
                userProfile: {
                    fields: {
                        userId: { type: "serial", primaryKey: true },
                    },
                },
            },
        } as const;

        const result = normalizeConfig(config);

        // Column should be transformed
        expect(result.models["userProfile"]!.fields["userId"]!.column).toBe(
            "user_id",
        );
        // Table should remain unchanged due to default identity function
        expect(result.models["userProfile"]!.table).toBe("userProfile");
    });

    test("handles empty extensions array", () => {
        const config = {
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
            extensions: [],
        } as const;

        const result = normalizeConfig(config);

        expect(result.extensions).toEqual([]);
    });
});
