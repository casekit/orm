import { createModel } from "@casekit/orm";

import { sql } from "~/sql/sql";

export const post = createModel({
    columns: {
        id: {
            type: "uuid",
            primaryKey: true,
            default: sql`uuid_generate_v4()`,
        },
        title: { type: "text" },
        content: { type: "text" },
        publishedAt: {
            type: "timestamp",
            nullable: true,
        },
    },
});
