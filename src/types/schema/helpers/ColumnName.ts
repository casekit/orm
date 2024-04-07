import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { ModelName } from "./ModelName";

export type ColumnName<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Extract<keyof Models[M]["columns"], string>;
