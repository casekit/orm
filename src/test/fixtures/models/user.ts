import { z } from "zod";

import { createModel } from "../../..";
import { sql } from "../../../sql";

export const user = createModel({
    columns: {
        id: {
            schema: z.string().uuid(),
            type: "uuid",
            primaryKey: true,
            default: sql`uuid_generate_v4()`,
        },
        username: { schema: z.string(), type: "text", unique: true },
        joinedAt: {
            schema: z.string().datetime(),
            type: "timestamp",
            nullable: true,
        },
    },
});
