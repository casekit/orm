import { createModel } from "@casekit/orm";

import { z } from "zod";
import { sql } from "~/util/sql";

export const post = createModel({
    columns: {
        id: {
            schema: z.string().uuid(),
            type: "uuid",
            primaryKey: true,
            default: sql`uuid_generate_v4()`,
        },
        title: { schema: z.string(), type: "text" },
        content: { schema: z.string(), type: "text" },
        publishedAt: {
            schema: z.date(),
            type: "timestamp",
            nullable: true,
        },
    },
});
