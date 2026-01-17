import { ModelDefinition } from "../definition/ModelDefinition.js";

export type ProvidedField<Model extends ModelDefinition> = {
    [K in keyof Model["fields"]]: Model["fields"][K]["provided"] extends true
        ? K
        : never;
}[keyof Model["fields"]];
