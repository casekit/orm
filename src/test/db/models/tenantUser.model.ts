import { ModelDefinition } from "../../..";
import { sql } from "../../../sql";

export const tenantUser = {
    table: "tenant_user",
    columns: {
        id: {
            type: "uuid",
            default: sql`uuid_generate_v4()`,
            primaryKey: true,
        },
        tenantId: {
            type: "uuid",
            references: { table: "tenant", column: "id" },
        },
        userId: { type: "uuid", references: { table: "user", column: "id" } },
        createdAt: { type: "timestamp with time zone", default: sql`now()` },
        deletedAt: {
            type: "timestamp with time zone",
            nullable: true,
        },
    },
} as const satisfies ModelDefinition;
