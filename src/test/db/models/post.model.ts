import { ModelDefinition } from "../../../schema/types/definitions/ModelDefinition";
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
        publishedAt: { type: "timestamp", nullable: true },
        tags: { type: "text[][][][]", nullable: true },
        tenantId: {
            type: "uuid",
            references: { table: "tenant", column: "id" },
            default: "00000000-0000-0000-0000-000000000000",
        },
    },
} satisfies ModelDefinition;
