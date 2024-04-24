import { z } from "zod";

import { ModelDefinition } from "../../..";
import { sql } from "../../../sql";

export const user = {
    columns: {
        id: { type: "uuid", default: sql`uuid_generate_v4()` },
        username: { zodSchema: z.string(), type: "text" },
        invitedById: {
            name: "invited_by_id",
            type: "uuid",
            nullable: true,
            references: { table: "user", column: "id" },
        },
        joinedAt: {
            name: "created_at",
            zodSchema: z.date(),
            type: "timestamp",
            nullable: true,
        },
        updatedAt: { type: "timestamp", nullable: true },
        deletedAt: { zodSchema: z.date(), type: "timestamp", nullable: true },
    },
    primaryKey: ["id"],
    uniqueConstraints: [
        { columns: ["username"], where: sql`deleted_at IS NULL` },
    ],
} as const satisfies ModelDefinition;
