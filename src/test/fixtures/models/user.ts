import { z } from "zod";

import { createModel } from "../../..";
import { sql } from "../../../sql";

export const user = createModel({
    columns: {
        id: { type: "uuid", default: sql`uuid_generate_v4()` },
        username: { schema: z.string(), type: "text" },
        joinedAt: { schema: z.date(), type: "timestamp", nullable: true },
        deletedAt: { schema: z.date(), type: "timestamp", nullable: true },
    },
    primaryKey: ["id"],
    uniqueConstraints: [
        { columns: ["username"], where: sql`deleted_at IS NULL` },
    ],
});
