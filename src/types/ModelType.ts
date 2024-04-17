import { LooseModelDefinition } from "../schema/types/loose/LooseModelDefinition";
import { ColumnName } from "./ColumnName";
import { ColumnType } from "./ColumnType";

export type ModelType<Model extends LooseModelDefinition> = {
    [C in ColumnName<Model>]: ColumnType<Model, C>;
};
