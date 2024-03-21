import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ColumnType } from "../schema/helpers/ColumnType";
import { ModelName } from "../schema/helpers/ModelName";
import { BaseQuery } from "./BaseQuery";

export type QueryResult<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    Q extends BaseQuery,
> = Readonly<{
    [C in Extract<Q["select"][number], string>]: ColumnType<S, M, C>;
}>;
