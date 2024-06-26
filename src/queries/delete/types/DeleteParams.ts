import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { ReturningClause } from "../../clauses/ReturningClause";
import { WhereClause } from "../../clauses/WhereClause";

export type DeleteParams<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = {
    where: WhereClause<Models, M>;
    returning?: ReturningClause<Models[M]>;
};
