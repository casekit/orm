import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { IncludeClause } from "../../clauses/IncludeClause";
import { SelectClause } from "../../clauses/SelectClause";
import { WhereClause } from "../../clauses/WhereClause";

export type FindOneParams<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
    where?: WhereClause<Models, M>;
    include?: IncludeClause<Models, Relations, M>;
};
