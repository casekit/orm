import { createModel } from "@casekit/orm";

import { z } from "zod";

export const post = createModel({
    columns: {
        id: { schema: z.string(), type: "bigint", primaryKey: true },
        title: { schema: z.string(), type: "text" },
        content: { schema: z.string(), type: "text" },
        publishedAt: {
            schema: z.date(),
            type: "timestamp",
            nullable: true,
        },
    },
});
