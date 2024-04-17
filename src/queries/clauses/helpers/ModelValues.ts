import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";

export type ModelValues<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = { [C in ColumnName<Models, M>]: ColumnType<Models, M, C> };
