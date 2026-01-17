import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";

import { NormalizedOneToManyRelationDefinition } from "../types/NormalizedRelationDefinition.js";
import { normalizeRelations } from "./normalizeRelations.js";
import { populateModels } from "./populateModels.js";

describe("normalizeRelations", () => {
    test("normalizes one-to-many relation", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial" },
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
                        id: { type: "serial" },
                        authorId: { type: "integer" },
                    },
                },
            },
        });

        const result = normalizeRelations(models, models["user"]!);

        expect(result).toEqual({
            posts: {
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
            },
        });
    });

    test("normalizes many-to-one relation", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                post: {
                    fields: {
                        id: { type: "serial" },
                        authorId: { type: "integer" },
                    },
                    relations: {
                        author: {
                            type: "N:1",
                            model: "user",
                            fromField: "authorId",
                            toField: "id",
                        },
                    },
                },
                user: {
                    fields: {
                        id: { type: "serial" },
                    },
                },
            },
        });

        const result = normalizeRelations(models, models["post"]!);

        expect(result).toEqual({
            author: {
                name: "author",
                type: "N:1",
                model: "user",
                table: "user",
                from: {
                    fields: ["authorId"],
                    columns: ["author_id"],
                },
                to: {
                    fields: ["id"],
                    columns: ["id"],
                },
                optional: false,
            },
        });
    });

    test("normalizes many-to-many relation", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial" },
                    },
                    relations: {
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
                        id: { type: "serial" },
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

        const result = normalizeRelations(models, models["user"]!);

        expect(result).toEqual({
            likedPosts: {
                model: "post",
                name: "likedPosts",
                table: "post",
                through: {
                    model: "like",
                    table: "like",
                    fromRelation: "user",
                    toRelation: "post",
                },
                type: "N:N",
            },
        });
    });

    test("handles composite keys in relations", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                order: {
                    fields: {
                        orderId: { type: "integer" },
                        productId: { type: "integer" },
                        variantId: { type: "integer" },
                        lineNumber: { type: "integer" },
                    },
                    relations: {
                        product: {
                            type: "N:1",
                            model: "product",
                            fromField: ["productId", "variantId"],
                            toField: ["id", "variantId"],
                        },
                    },
                },
                product: {
                    fields: {
                        id: { type: "serial" },
                        variantId: { type: "integer" },
                    },
                },
            },
        });

        const result = normalizeRelations(models, models["order"]!);

        expect(result).toEqual({
            product: {
                name: "product",
                type: "N:1",
                model: "product",
                table: "product",
                from: {
                    fields: ["productId", "variantId"],
                    columns: ["product_id", "variant_id"],
                },
                to: {
                    fields: ["id", "variantId"],
                    columns: ["id", "variant_id"],
                },
                optional: false,
            },
        });
    });

    test("throws error for non-existent related model", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial" },
                    },
                    relations: {
                        posts: {
                            type: "1:N",
                            model: "nonexistent",
                            fromField: "id",
                            toField: "authorId",
                        },
                    },
                },
            },
        });

        expect(() => normalizeRelations(models, models["user"]!)).toThrow(
            'Model "user" has relation "posts" that references non-existent model "nonexistent".',
        );
    });

    test("throws error for non-existent join model", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial" },
                    },
                    relations: {
                        likedPosts: {
                            type: "N:N",
                            model: "post",
                            through: {
                                model: "nonexistent",
                                fromRelation: "user",
                                toRelation: "post",
                            },
                        },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial" },
                    },
                },
            },
        });

        expect(() => normalizeRelations(models, models["user"]!)).toThrow(
            'Model "user" has relation "likedPosts" with join model "nonexistent" that does not exist.',
        );
    });

    test("throws error for non-existent field in relation", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial" },
                    },
                    relations: {
                        posts: {
                            type: "1:N",
                            model: "post",
                            fromField: "nonexistent",
                            toField: "authorId",
                        },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial" },
                        authorId: { type: "integer" },
                    },
                },
            },
        });

        expect(() => normalizeRelations(models, models["user"]!)).toThrow(
            'Model "user" has relation with non-existent field "nonexistent".',
        );
    });

    test("handles custom column names", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: {
                            type: "serial",
                            column: "user_identifier",
                        },
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
                        id: { type: "serial" },
                        authorId: {
                            type: "integer",
                            column: "created_by_user",
                        },
                    },
                },
            },
        });

        const result = normalizeRelations(models, models["user"]!);

        const posts = result["posts"]! as NormalizedOneToManyRelationDefinition;
        expect(posts.from.columns).toEqual(["user_identifier"]);
        expect(posts.to.columns).toEqual(["created_by_user"]);
    });
});
