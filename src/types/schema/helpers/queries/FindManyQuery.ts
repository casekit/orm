import { NonEmptyArray } from "../../../util/NonEmptyArray";
import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../definitions/RelationsDefinitions";
import { ColumnName } from "../ColumnName";
import { ModelName } from "../ModelName";
import { IncludeClause } from "./IncludeClause";
import { SelectClause } from "./SelectClause";
import { WhereClause } from "./WhereClause";

export type FindManyQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
    include?: IncludeClause<Models, Relations, M>;
    where?: WhereClause<Models, M>;
    limit?: number;
    offset?: number;
    orderBy?: NonEmptyArray<
        ColumnName<Models, M> | [ColumnName<Models, M>, "asc" | "desc"]
    >;
};
