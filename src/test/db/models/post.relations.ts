import { RelationsDefinition } from "../../../schema/types/strict/RelationsDefinition";
import { type Models } from "../models";

export const post = {
    author: {
        model: "user",
        type: "N:1",
        foreignKey: "authorId",
    },
    tenant: {
        model: "tenant",
        type: "N:1",
        foreignKey: "tenantId",
    },
} as const satisfies RelationsDefinition<Models, "post">;
