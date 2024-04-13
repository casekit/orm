import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../../clauses/ReturningClause";
import { WhereClause } from "../../clauses/WhereClause";

export type DeleteParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    where: WhereClause<Models, M>;
    returning?: ReturningClause<Models, M>;
};
