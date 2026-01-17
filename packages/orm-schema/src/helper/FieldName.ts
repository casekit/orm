import { ModelDefinition } from "#definition/ModelDefinition.js";

export type FieldName<Model extends ModelDefinition> = keyof Model["fields"];
