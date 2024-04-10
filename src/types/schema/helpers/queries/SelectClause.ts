import { NonEmptyArray } from "../../../util/NonEmptyArray";
import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnName } from "../ColumnName";
import { ModelName } from "../ModelName";

export type SelectClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = NonEmptyArray<ColumnName<Models, M>>;
