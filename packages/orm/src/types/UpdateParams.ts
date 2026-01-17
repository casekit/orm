import {
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { ReturningClause } from "./ReturningClause.js";
import { UpdateValues } from "./UpdateValues.js";
import { WhereClause } from "./WhereClause.js";

export type UpdateParams<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
> = {
    set: UpdateValues<Models[M]>;
    where: WhereClause<Models, Operators, M>;
    returning?: ReturningClause<Models[M]>;
};
