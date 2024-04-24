import { IsNullable } from "../schema/types/helpers/IsNullable";
import { LooseModelDefinition } from "../schema/types/loose/LooseModelDefinition";
import { ColumnName } from "./ColumnName";
import { ColumnType } from "./ColumnType";
import { Simplify } from "./util/Simplify";

export type NullableColumn<Model extends LooseModelDefinition> = {
    [C in ColumnName<Model>]: IsNullable<Model, C> extends true ? C : never;
}[ColumnName<Model>];

export type ModelType<Model extends LooseModelDefinition> = Simplify<
    {
        [C in Exclude<ColumnName<Model>, NullableColumn<Model>>]: ColumnType<
            Model,
            C
        >;
    } & {
        [C in NullableColumn<Model>]?: ColumnType<Model, C>;
    }
>;
