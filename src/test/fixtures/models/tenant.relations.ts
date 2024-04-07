import { RelationsDefinition } from "src/types/schema/definitions/RelationsDefinition";

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
} satisfies RelationsDefinition<Models, "tenant">;
