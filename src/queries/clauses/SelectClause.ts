import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../schema/types/helpers/ColumnName";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { NonEmptyArray } from "../../types/util/NonEmptyArray";

export type SelectClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = NonEmptyArray<ColumnName<Models, M>>;
