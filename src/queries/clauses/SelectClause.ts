import { ColumnName } from "../../schema/types/helpers/ColumnName";
import { LooseModelDefinition } from "../../schema/types/loose/LooseModelDefinition";
import { NonEmptyArray } from "../../types/util/NonEmptyArray";

export type SelectClause<Model extends LooseModelDefinition> = NonEmptyArray<
    ColumnName<Model>
>;
