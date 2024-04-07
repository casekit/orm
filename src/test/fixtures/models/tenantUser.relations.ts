import { RelationDefinitions } from "src/types/schema/definition/RelationDefinitions";

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
} satisfies RelationDefinitions<Models, "tenantUser">;
