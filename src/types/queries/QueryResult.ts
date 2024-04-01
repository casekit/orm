import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ColumnType } from "../schema/helpers/ColumnType";
import { ModelName2 } from "../schema/helpers/ModelName";
import { BaseQuery } from "./BaseQuery";

export type QueryResult<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
    Q extends BaseQuery,
> = Readonly<{
    [C in Extract<Q["select"][number], string>]: ColumnType<Models, M, C>;
}>;
