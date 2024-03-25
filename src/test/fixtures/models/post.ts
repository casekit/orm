import { createModel } from "../../..";
import { sql } from "../../../sql";

export const post = createModel({
    columns: {
        id: { type: "uuid", default: sql`uuid_generate_v4()` },
        title: { type: "text" },
        content: { type: "text" },
        authorId: { type: "uuid" },
        publishedAt: { type: "timestamp", nullable: true },
        tags: { type: "text[][][][]", nullable: true },
    },
    constraints: {
        primaryKey: ["id"],
    },
});
