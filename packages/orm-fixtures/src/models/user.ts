import { z } from "zod";

import { ModelDefinition } from "@casekit/orm-schema";
import { sql } from "@casekit/sql";

export const user = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text" },
        email: { type: "text", zodSchema: z.email() },
        role: { type: "text", zodSchema: z.enum(["user", "admin"]) },
        preferences: { type: "jsonb", default: "{}" },
        createdAt: { type: "timestamp", default: sql`now()` },
        deletedAt: { type: "timestamp", nullable: true },
    },
    uniqueConstraints: [
        { fields: ["email", "deletedAt"], nullsNotDistinct: true },
    ],
    relations: {
        posts: {
            type: "1:N",
            model: "post",
            fromField: "id",
            toField: "authorId",
        },
        friends: {
            type: "N:N",
            model: "user",
            through: {
                model: "friendship",
                fromRelation: "user",
                toRelation: "friend",
            },
        },
        friendships: {
            type: "1:N",
            model: "friendship",
            fromField: "id",
            toField: "userId",
        },
    },
} as const satisfies ModelDefinition;
