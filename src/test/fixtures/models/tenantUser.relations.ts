import { Relations } from "../../../types/schema/definition/Relation";
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
} satisfies Relations<Models, "tenantUser">;
