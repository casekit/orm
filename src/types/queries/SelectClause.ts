import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ColumnName } from "../schema/helpers/ColumnName";
import { ModelName } from "../schema/helpers/ModelName";
import { NonEmptyArray } from "../util/NonEmptyArray";

export type SelectClause<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = NonEmptyArray<ColumnName<S, M>>;
