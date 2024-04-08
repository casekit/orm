import { RelationsDefinition } from "src/types/schema/definitions/RelationsDefinition";

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
} satisfies RelationsDefinition<Models, "post">;