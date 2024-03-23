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
        username: { schema: z.string(), type: "text" },
        joinedAt: {
            schema: z.date(),
            type: "timestamp",
            nullable: true,
        },
        deletedAt: {
            schema: z.date(),
            type: "timestamp",
            nullable: true,
        },
    },
    constraints: {
        unique: [
            {
                name: "foo",
                columns: ["username"],
                where: sql`deleted_at IS NULL`,
            },
        ],
    },
});
