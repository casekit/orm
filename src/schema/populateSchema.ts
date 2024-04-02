import { PopulatedSchema } from "../types/schema";
import { SchemaDefinition } from "../types/schema/definition/SchemaDefinition";
import { createConfig } from "./createConfig";
import { populateModel } from "./populateModel";

export const populateSchema = <S extends SchemaDefinition>(
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
