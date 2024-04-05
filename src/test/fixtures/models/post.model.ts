import { sql } from "../../../sql";
import { ModelDefinition } from "../../../types/schema/definition/ModelDefinition";

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
    },
} satisfies ModelDefinition;
