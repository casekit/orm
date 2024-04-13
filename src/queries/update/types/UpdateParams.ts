import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../../clauses/ReturningClause";
import { WhereClause } from "../../clauses/WhereClause";
import { UpdateValues } from "./UpdateValues";

export type UpdateParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    set: UpdateValues<Models, M>;
    where: WhereClause<Models, M>;
    returning?: ReturningClause<Models, M>;
};
