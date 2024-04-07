import { RelationsDefinition } from "src/types/schema/definition/RelationsDefinition";

import { type Models } from "../models";

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
} satisfies RelationsDefinition<Models, "tenantUser">;
