import { RelationsDefinition } from "../../..";
import { Models } from "../models";

export const user = {
    posts: {
        type: "1:N",
        model: "post",
        foreignKey: "authorId",
    },
    tenancies: {
        type: "1:N",
        model: "tenantUser",
        foreignKey: "userId",
    },
    tenants: {
        type: "N:N",
        model: "tenant",
        through: "tenantUser",
        foreignKey: "userId",
        otherKey: "tenantId",
    },
} as const satisfies RelationsDefinition<Models, "user">;
