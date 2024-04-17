import { ModelDefinition } from "../schema/types/definitions/ModelDefinition";
import { ColumnName } from "./ColumnName";
import { ColumnType } from "./ColumnType";

export type ModelType<Model extends ModelDefinition> = {
    [C in ColumnName<Model>]: ColumnType<Model, C>;
};
