import { ModelDefinitions } from "../definition/ModelDefinitions";
import { SchemaDefinition } from "../definition/SchemaDefinition";
import { ModelName, ModelName2 } from "./ModelName";

export type ColumnName<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = Extract<keyof S["models"][M]["columns"], string>;

export type ColumnName2<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = Extract<keyof Models[M]["columns"], string>;
