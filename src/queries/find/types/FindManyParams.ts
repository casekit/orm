import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { NonEmptyArray } from "../../../types/util/NonEmptyArray";
import { IncludeClause } from "../../clauses/IncludeClause";
import { SelectClause } from "../../clauses/SelectClause";
import { WhereClause } from "../../clauses/WhereClause";

export type FindManyParams<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models[M]>;
    include?: IncludeClause<Models, Relations, M>;
    where?: WhereClause<Models, M>;
    limit?: number;
    offset?: number;
    orderBy?: NonEmptyArray<
        ColumnName<Models[M]> | [ColumnName<Models[M]>, "asc" | "desc"]
    >;
};
