import { identity, mapValues } from "lodash-es";
import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { Configuration } from "../../types/Configuration";
import { ModelDefinitions } from "../../types/schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../types/schema/definitions/RelationsDefinitions";
import { populateModel } from "./populateModel";

export const populateConfiguration = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
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

    const extensions = config.extensions ?? [];

    const connection = config.connection ?? {};

    return {
        naming,
        schema,
        models,
        relations,
        extensions,
        connection,
    };
};