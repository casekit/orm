import { ModelDefinition } from "@casekit/orm-schema";

export const counter = {
    fields: { counter: { type: "serial", primaryKey: true } },
} as const satisfies ModelDefinition;
