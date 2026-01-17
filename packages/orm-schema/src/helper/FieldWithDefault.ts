import { ModelDefinition } from "../definition/ModelDefinition.js";

export type FieldWithDefault<Model extends ModelDefinition> = {
    [K in keyof Model["fields"]]: Model["fields"][K]["default"] extends NonNullable<
        Model["fields"][K]["default"]
    >
        ? K
        : never;
}[keyof Model["fields"]];
