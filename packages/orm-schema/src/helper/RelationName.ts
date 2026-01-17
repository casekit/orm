import { ModelDefinition } from "#definition/ModelDefinition.js";

export type RelationName<Model extends ModelDefinition> =
    keyof Model["relations"];
