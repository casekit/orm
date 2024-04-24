import { RelationsDefinition } from "../../..";
import { Models } from "../models";

export const post = {
    author: {
        model: "user",
        type: "N:1",
        foreignKey: "authorId",
    },
    reviewedBy: {
        model: "user",
        type: "N:1",
        foreignKey: "reviewedById",
        optional: true,
    },
    tenant: {
        model: "tenant",
        type: "N:1",
        foreignKey: "tenantId",
    },
} as const satisfies RelationsDefinition<Models, "post">;
