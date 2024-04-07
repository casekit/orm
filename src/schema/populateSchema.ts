import { BaseConfiguration, BaseModels } from "../types/schema";
import { Configuration } from "../types/schema/definition/Configuration";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";
import { RelationsDefinitions } from "../types/schema/definition/RelationsDefinitions";
import { createConfig } from "./createConfig";
import { populateModel } from "./populateModel";

export const populateSchema = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    schema: Configuration<Models, Relations>,
): BaseConfiguration => {
    const config = createConfig(schema.config);

    const models = Object.fromEntries(
        Object.entries(schema.models).map(([name, model]) => [
            name,
            populateModel(config, name, model),
        ]),
    ) as BaseModels;

    return {
        config,
        models,
        relations: schema.relations,
        extensions: schema.extensions ?? [],
    } as BaseConfiguration;
};
