import {
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { ReturningClause } from "./ReturningClause.js";
import { WhereClause } from "./WhereClause.js";

export type DeleteParams<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
> = {
    returning?: ReturningClause<Models[M]>;
    where: WhereClause<Models, Operators, M>;
};
