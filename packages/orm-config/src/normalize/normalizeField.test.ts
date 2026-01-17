import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";
import { ZodType } from "zod";

import { normalizeField } from "./normalizeField.js";
import { populateModels } from "./populateModels.js";

describe("normalizeField", () => {
    test("strips out references, unique, and primary key properties", () => {
        const models = populateModels({
            naming: {
                column: snakeCase,
            },
            models: {
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        slug: {
                            type: "text",
                            unique: true,
                        },
                        authorId: {
                            type: "integer",
                            references: {
                                model: "user",
                                field: "id",
                            },
                        },
                    },
                },
            },
        });

        expect(normalizeField(models["post"]!.fields["id"]!)).toEqual({
            name: "id",
            column: "id",
            type: "serial",
            zodSchema: expect.any(ZodType),
            nullable: false,
            default: null,
            provided: false,
        });

        expect(normalizeField(models["post"]!.fields["slug"]!)).toEqual({
            name: "slug",
            column: "slug",
            type: "text",
            zodSchema: expect.any(ZodType),
            nullable: false,
            default: null,
            provided: false,
        });

        expect(normalizeField(models["post"]!.fields["authorId"]!)).toEqual({
            name: "authorId",
            column: "author_id",
            type: "integer",
            zodSchema: expect.any(ZodType),
            nullable: false,
            default: null,
            provided: false,
        });
    });
});
