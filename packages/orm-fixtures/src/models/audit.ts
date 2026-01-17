import { ModelDefinition } from "@casekit/orm-schema";

export const audit = {
    fields: {
        id: { type: "serial", primaryKey: true },
        change: { type: "text", provided: true },
        userId: { type: "integer" },
    },
} as const satisfies ModelDefinition;
