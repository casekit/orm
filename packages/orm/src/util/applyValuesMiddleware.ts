import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinition } from "@casekit/orm-schema";

import { CreateValues } from "../types/CreateValues.js";
import { Middleware } from "../types/Middleware.js";

export const applyValuesMiddleware = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    values: CreateValues<ModelDefinition>,
): CreateValues<ModelDefinition> => {
    return middleware
        .filter((m) => !!m.values)
        .reduce((acc, m) => {
            return m.values!(config, modelName, acc);
        }, values);
};
