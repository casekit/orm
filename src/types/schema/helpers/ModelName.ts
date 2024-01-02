import { SchemaDefinition } from "../definition/SchemaDefinition";

export type ModelName<S extends SchemaDefinition> = Extract<
    keyof S["models"],
    string
>;
