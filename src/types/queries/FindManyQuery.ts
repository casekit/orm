import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/definitions/RelationsDefinitions";
import { ColumnName } from "../schema/helpers/ColumnName";
import { ModelName } from "../schema/helpers/ModelName";
import { NonEmptyArray } from "../util/NonEmptyArray";
import { IncludeClause } from "./IncludeClause";
import { SelectClause } from "./SelectClause";

export type FindManyQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
    include?: IncludeClause<Models, Relations, M>;
    limit?: number;
    offset?: number;
    orderBy?: NonEmptyArray<
        ColumnName<Models, M> | [ColumnName<Models, M>, "asc" | "desc"]
    >;
};
