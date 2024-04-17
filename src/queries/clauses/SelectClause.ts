import { ColumnName } from "../../schema/types/helpers/ColumnName";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { NonEmptyArray } from "../../types/util/NonEmptyArray";

export type SelectClause<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = NonEmptyArray<ColumnName<Models, M>>;
