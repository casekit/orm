import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ColumnName2 } from "../schema/helpers/ColumnName";
import { ModelName2 } from "../schema/helpers/ModelName";
import { NonEmptyArray } from "../util/NonEmptyArray";

export type SelectClause<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = NonEmptyArray<ColumnName2<Models, M>>;
