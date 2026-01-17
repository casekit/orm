import { ModelDefinition } from "@casekit/orm-schema";

export const friendshipStats = {
    fields: {
        id: { type: "serial", primaryKey: true },
        userId: { type: "integer" },
        friendId: { type: "integer" },
        messagesSent: { type: "integer", default: 0 },
        likesGiven: { type: "integer", default: 0 },
    },
    foreignKeys: [
        {
            fields: ["userId", "friendId"],
            references: {
                model: "friendship",
                fields: ["userId", "friendId"],
            },
            onDelete: "CASCADE",
        },
    ],
    relations: {
        friendship: {
            type: "N:1",
            model: "friendship",
            fromField: ["userId", "friendId"],
            toField: ["userId", "friendId"],
        },
    },
} as const satisfies ModelDefinition;
