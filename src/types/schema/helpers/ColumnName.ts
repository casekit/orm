import { SchemaDefinition } from "../definition/SchemaDefinition";
import { ModelName } from "./ModelName";

export type ColumnName<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = Extract<keyof S["models"][M]["columns"], string>;
