import { SchemaDefinition } from "../definition/SchemaDefinition";
import { ModelName } from "./ModelName";

export type Columns<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = S["models"][M]["columns"];
