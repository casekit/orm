import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { Middleware } from "../types/Middleware.js";
import { WhereClause } from "../types/WhereClause.js";

export const applyWhereMiddleware = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    where:
        | WhereClause<ModelDefinitions, OperatorDefinitions, string>
        | undefined,
): WhereClause<ModelDefinitions, OperatorDefinitions, string> | undefined => {
    return middleware
        .filter((m) => !!m.where)
        .reduce((acc, m) => {
            return m.where!(config, modelName, acc);
        }, where ?? {});
};
