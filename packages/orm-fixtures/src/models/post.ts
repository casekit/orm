import { z } from "zod";

import { ModelDefinition } from "@casekit/orm-schema";
import { sql } from "@casekit/sql";

export const post = {
    fields: {
        id: { type: "serial", primaryKey: true },
        title: { type: "text" },
        content: { type: "text" },
        tags: { type: "text[]", default: "{}" },
        authorId: {
            type: "integer",
            references: {
                model: "user",
                field: "id",
            },
        },
        backgroundColorValue: {
            type: "text",
            nullable: true,
            references: {
                model: "color",
                field: "hex",
                onDelete: "SET NULL",
            },
        },
        metadata: {
            type: "jsonb",
            default: "{}",
            zodSchema: z.object({
                foo: z.enum(["a", "b", "c"]),
                bar: z.array(
                    z.object({
                        baz: z.enum(["good", "bad", "indifferent"]),
                        quux: z.boolean(),
                    }),
                ),
            }),
        },
        createdAt: { type: "timestamp", default: sql`now()` },
        publishedAt: { type: "timestamp", nullable: true },
        deletedAt: { type: "timestamp", nullable: true },
    },
    relations: {
        author: {
            type: "N:1",
            model: "user",
            fromField: "authorId",
            toField: "id",
        },
        backgroundColor: {
            type: "N:1",
            model: "color",
            fromField: "backgroundColorValue",
            toField: "hex",
            optional: true,
        },
        likes: {
            type: "1:N",
            model: "like",
            fromField: "id",
            toField: "postId",
        },
    },
} as const satisfies ModelDefinition;
