import { identity, mapValues } from "lodash-es";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../../Connection";
import { Configuration } from "../../types/Configuration";
import { LooseModelDefinitions } from "../types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../types/loose/LooseRelationsDefinitions";
import { composeMiddleware } from "./composeMiddleware";
import { populateModel } from "./populateModel";

export const populateConfiguration = <
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
>(
    config: Configuration<Models, Relations>,
): BaseConfiguration => {
    const schema = config.schema ?? "public";

    const naming = {
        ...config.naming,
        table: config.naming?.table ?? identity,
        column: config.naming?.column ?? identity,
    };

    const models = mapValues(config.models, (model, name) => {
        return populateModel({ naming, schema }, name, model);
    });

    const relations = mapValues(models, (_, name) => {
        return config.relations?.[name] ?? {};
    });

    const connection = new Connection(config.pool);

    const extensions = config.extensions ?? [];

    const middleware = composeMiddleware(config.middleware ?? []);

    return {
        naming,
        schema,
        models,
        relations,
        extensions,
        connection,
        middleware,
    };
};
