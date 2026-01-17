import { ModelDefinition } from "../definition/ModelDefinition.js";

export type NullableField<Model extends ModelDefinition> = {
    [K in keyof Model["fields"]]: Model["fields"][K]["nullable"] extends true
        ? K
        : never;
}[keyof Model["fields"]];
