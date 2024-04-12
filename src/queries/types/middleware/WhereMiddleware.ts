import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { Configuration } from "../../../types/Configuration";
import { WhereClause } from "../WhereClause";

export type WhereMiddleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = <M extends ModelName<Models>>(
    config: Configuration<Models, Relations>,
    m: M,
    where: WhereClause<Models, M>,
) => WhereClause<Models, M>;
