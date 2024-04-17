import { RelationsDefinition } from "../../../schema/types/strict/RelationsDefinition";
import { Models } from "../models";

export const tenantUser = {
    user: {
        model: "user",
        type: "N:1",
        foreignKey: "userId",
    },
    tenant: {
        model: "tenant",
        type: "N:1",
        foreignKey: "tenantId",
    },
} as const satisfies RelationsDefinition<Models, "tenantUser">;
