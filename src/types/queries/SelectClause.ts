import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { ColumnName } from "../schema/helpers/ColumnName";
import { ModelName } from "../schema/helpers/ModelName";
import { NonEmptyArray } from "../util/NonEmptyArray";

export type SelectClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = NonEmptyArray<ColumnName<Models, M>>;
