import { createModel } from "@casekit/orm";

import { z } from "zod";

export const user = createModel({
    columns: {
        id: { schema: z.string(), type: "uuid", primaryKey: true },
        name: { schema: z.string(), type: "text" },
        joinedAt: {
            schema: z.string().datetime(),
            type: "timestamp",
            nullable: true,
        },
    },
});
