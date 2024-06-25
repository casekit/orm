import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { IncludeClause } from "../../clauses/IncludeClause";
import { OrderByClause } from "../../clauses/OrderByClause";
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
    orderBy?: OrderByClause<Models, Relations, M>;
    for?: "update" | "no key update" | "share" | "key share";
};
