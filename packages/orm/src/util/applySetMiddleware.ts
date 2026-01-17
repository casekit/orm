import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinition } from "@casekit/orm-schema";

import { Middleware } from "../types/Middleware.js";
import { UpdateValues } from "../types/UpdateValues.js";

export const applySetMiddleware = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    set: UpdateValues<ModelDefinition>,
): UpdateValues<ModelDefinition> => {
    return middleware
        .filter((m) => !!m.set)
        .reduce((acc, m) => {
            return m.set!(config, modelName, acc);
        }, set);
};
