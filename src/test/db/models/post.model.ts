import { ModelDefinition } from "../../..";
import { sql } from "../../../sql";

export const post = {
    columns: {
        id: {
            type: "uuid",
            default: sql`uuid_generate_v4()`,
            primaryKey: true,
        },
        title: { type: "text" },
        content: { type: "text" },
        authorId: {
            name: "created_by_id",
            type: "uuid",
            references: { table: "user", column: "id" },
        },
        reviewedById: {
            name: "reviewed_by_id",
            type: "uuid",
            nullable: true,
            references: { table: "user", column: "id" },
        },
        publishedAt: { type: "timestamp", nullable: true },
        tags: { type: "text[][][][]", nullable: true },
        tenantId: {
            type: "uuid",
            references: { table: "tenant", column: "id" },
            default: "00000000-0000-0000-0000-000000000000",
        },
        updatedAt: { type: "timestamp", nullable: true },
        deletedAt: { type: "timestamp", nullable: true },
    },
} as const satisfies ModelDefinition;
