import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { ReturningClause } from "../../clauses/ReturningClause";
import { WhereClause } from "../../clauses/WhereClause";
import { UpdateValues } from "./UpdateValues";

export type UpdateParams<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = {
    set: UpdateValues<Models, M>;
    where: WhereClause<Models, M>;
    returning?: ReturningClause<Models[M]>;
};
