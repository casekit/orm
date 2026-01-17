import { ModelDefinition } from "@casekit/orm-schema";

export const color = {
    fields: {
        hex: { type: "text", primaryKey: true },
        name: { type: "text" },
    },
} as const satisfies ModelDefinition;
