import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { ColumnName } from "./ColumnName";
import { ColumnType } from "./ColumnType";
import { ModelName } from "./ModelName";

export type ModelType<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = { [C in ColumnName<Models, M>]: ColumnType<Models, M, C> };
