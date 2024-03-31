import { createModel } from "../../..";
import { sql } from "../../../sql";

export const post = createModel({
    columns: {
        id: {
            type: "uuid",
            default: sql`uuid_generate_v4()`,
            primaryKey: true,
        },
        title: { type: "text" },
        content: { type: "text" },
        authorId: { name: "created_by_id", type: "uuid" },
        publishedAt: { type: "timestamp", nullable: true },
        tags: { type: "text[][][][]", nullable: true },
    },
});
