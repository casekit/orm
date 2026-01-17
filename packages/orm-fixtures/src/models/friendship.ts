import { ModelDefinition } from "@casekit/orm-schema";

export const friendship = {
    fields: {
        userId: { type: "integer" },
        friendId: { type: "integer" },
    },
    primaryKey: ["userId", "friendId"],
    relations: {
        user: {
            type: "N:1",
            model: "user",
            fromField: "userId",
            toField: "id",
        },
        friend: {
            type: "N:1",
            model: "user",
            fromField: "friendId",
            toField: "id",
        },
        stats: {
            type: "N:1",
            model: "friendshipStats",
            fromField: ["userId", "friendId"],
            toField: ["userId", "friendId"],
            optional: true,
        },
    },
} as const satisfies ModelDefinition;
