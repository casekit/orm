import { ModelDefinition } from "@casekit/orm-schema";

export const employee = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text" },
        departmentId: {
            type: "integer",
            references: {
                model: "department",
                field: "id",
            },
        },
    },
    relations: {
        department: {
            type: "N:1",
            model: "department",
            fromField: "departmentId",
            toField: "id",
        },
        tasks: {
            type: "1:N",
            model: "task",
            fromField: "id",
            toField: "assigneeId",
        },
    },
} as const satisfies ModelDefinition;
