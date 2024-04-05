import { Relations } from "../../../types/schema/definition/Relation";
import { type Models } from "../models";

export const tenant = {
    users: {
        model: "user",
        through: "tenantUser",
        type: "N:N",
        foreignKey: "tenantId",
        otherKey: "userId",
    },
    posts: {
        model: "post",
        type: "1:N",
        foreignKey: "tenantId",
    },
} satisfies Relations<Models, "tenant">;
