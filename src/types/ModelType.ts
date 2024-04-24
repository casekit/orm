import { OptionalColumn } from "../queries/clauses/helpers/OptionalColumn";
import { RequiredColumn } from "../queries/clauses/helpers/RequiredColumn";
import { LooseModelDefinition } from "../schema/types/loose/LooseModelDefinition";
import { ColumnType } from "./ColumnType";

export type ModelType<Model extends LooseModelDefinition> = {
    [C in RequiredColumn<Model>]: ColumnType<Model, C>;
} & {
    [C in OptionalColumn<Model>]?: ColumnType<Model, C>;
};
