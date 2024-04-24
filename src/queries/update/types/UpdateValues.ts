import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { Simplify } from "../../../types/util/Simplify";

export type UpdateValues<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = Simplify<{
    [C in ColumnName<Models[M]>]?: ColumnType<Models, M, C>;
}>;
