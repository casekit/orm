import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { WhereClause } from "../clauses/WhereClause";

export type WhereMiddleware = (
    where:
        | WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>
        | undefined,
    meta: {
        model: string;
        config: BaseConfiguration;
    },
) => WhereClause<ModelDefinitions, ModelName<ModelDefinitions>> | undefined;
