import { ModelDefinition } from "@casekit/orm-schema";

export const department = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text" },
    },
    relations: {
        employees: {
            type: "1:N",
            model: "employee",
            fromField: "id",
            toField: "departmentId",
        },
    },
} as const satisfies ModelDefinition;
