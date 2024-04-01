import { ModelDefinitions } from "../definition/ModelDefinitions";
import { SchemaDefinition } from "../definition/SchemaDefinition";

export type ModelName<S extends SchemaDefinition> = Extract<
    keyof S["models"],
    string
>;

export type ModelName2<Models extends ModelDefinitions> = Extract<
    keyof Models,
    string
>;
