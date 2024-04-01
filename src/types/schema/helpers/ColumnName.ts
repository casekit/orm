import { ModelDefinitions } from "../definition/ModelDefinitions";
import { ModelName } from "./ModelName";

export type ColumnName<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Extract<keyof Models[M]["columns"], string>;
