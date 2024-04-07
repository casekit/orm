import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { ColumnType } from "../schema/helpers/ColumnType";
import { ModelName } from "../schema/helpers/ModelName";
import { BaseQuery } from "./BaseQuery";

export type QueryResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    Q extends BaseQuery,
> = Readonly<{
    [C in Extract<Q["select"][number], string>]: ColumnType<Models, M, C>;
}>;
