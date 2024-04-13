import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { NonEmptyArray } from "../../../types/util/NonEmptyArray";
import { IncludeClause } from "../../clauses/IncludeClause";
import { SelectClause } from "../../clauses/SelectClause";
import { WhereClause } from "../../clauses/WhereClause";

export type FindManyParams<
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
