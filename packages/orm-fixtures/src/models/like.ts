import { ModelDefinition } from "@casekit/orm-schema";
import { sql } from "@casekit/sql";

export const like = {
    fields: {
        id: { type: "serial", primaryKey: true },
        userId: {
            type: "integer",
            references: {
                model: "user",
                field: "id",
                onDelete: "CASCADE",
            },
        },
        postId: {
            type: "integer",
            references: {
                model: "post",
                field: "id",
                onDelete: "CASCADE",
            },
        },
        createdAt: { type: "timestamp", default: sql`now()` },
        deletedAt: { type: "timestamp", nullable: true },
    },
    uniqueConstraints: [
        { fields: ["userId", "postId"], where: sql`deleted_at IS NULL` },
    ],
    relations: {
        user: {
            type: "N:1",
            model: "user",
            fromField: "userId",
            toField: "id",
        },
        post: {
            type: "N:1",
            model: "post",
            fromField: "postId",
            toField: "id",
        },
    },
} as const satisfies ModelDefinition;
