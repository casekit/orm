import { ModelDefinition } from "@casekit/orm-schema";

export const task = {
    fields: {
        id: { type: "serial", primaryKey: true },
        title: { type: "text" },
        assigneeId: {
            type: "integer",
            nullable: true,
            references: {
                model: "employee",
                field: "id",
                onDelete: "SET NULL",
            },
        },
    },
    relations: {
        assignee: {
            type: "N:1",
            model: "employee",
            fromField: "assigneeId",
            toField: "id",
            optional: true,
        },
    },
} as const satisfies ModelDefinition;
