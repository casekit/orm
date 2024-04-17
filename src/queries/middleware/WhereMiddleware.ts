import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { WhereClause } from "../clauses/WhereClause";

export type WhereMiddleware = (
    where:
        | WhereClause<LooseModelDefinitions, ModelName<LooseModelDefinitions>>
        | undefined,
    meta: {
        model: string;
        config: BaseConfiguration;
    },
) =>
    | WhereClause<LooseModelDefinitions, ModelName<LooseModelDefinitions>>
    | undefined;
