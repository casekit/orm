import { identity, mapValues } from "es-toolkit";

import { Config } from "@casekit/orm-schema";

import { NormalizedConfig } from "#types/NormalizedConfig.js";
import { defaultLogger } from "./defaultLogger.js";
import { normalizeModel } from "./normalizeModel.js";
import { populateModels } from "./populateModels.js";

export const normalizeConfig = (config: Config): NormalizedConfig => {
    const models = populateModels(config);
    return {
        ...config,
        schema: config.schema ?? "public",
        models: mapValues(models, (model) => normalizeModel(models, model)),
        operators: config.operators ?? { where: {} },
        extensions: config.extensions ?? [],
        connection: config.connection ?? null,
        pool: config.pool ?? true,
        logger: config.logger ?? defaultLogger,
        naming: {
            column: config.naming?.column ?? identity,
            table: config.naming?.table ?? identity,
        },
    };
};
