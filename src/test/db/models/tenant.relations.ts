import { RelationsDefinition } from "../../../schema/types/strict/RelationsDefinition";
import { Models } from "../models";

export const tenant = {
    users: {
        model: "user",
        through: "tenantUser",
        type: "N:N",
        foreignKey: "tenantId",
        otherKey: "userId",
    },
    tenancies: {
        model: "tenantUser",
        type: "1:N",
        foreignKey: "tenantId",
    },
    posts: {
        model: "post",
        type: "1:N",
        foreignKey: "tenantId",
    },
} as const satisfies RelationsDefinition<Models, "tenant">;
