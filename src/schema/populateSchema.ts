import { PopulatedSchema } from "../types/schema";
import { Configuration } from "../types/schema/definition/Configuration";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";
import { createConfig } from "./createConfig";
import { populateModel } from "./populateModel";

export const populateSchema = <
    Models extends ModelDefinitions,
    S extends Configuration<Models>,
>(
    schema: S,
): PopulatedSchema<S["models"]> => {
    const config = createConfig(schema.config);

    const models = Object.fromEntries(
        Object.entries(schema.models).map(([name, model]) => [
            name,
            populateModel(config, name, model),
        ]),
    ) as PopulatedSchema<S["models"]>["models"];

    return {
        config,
        models,
        extensions: schema.extensions ?? [],
    };
};
