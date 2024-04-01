import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ColumnName } from "../schema/helpers/ColumnName";
import { ModelName } from "../schema/helpers/ModelName";
import { NonEmptyArray } from "../util/NonEmptyArray";

export type SelectClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = NonEmptyArray<ColumnName<Models, M>>;
