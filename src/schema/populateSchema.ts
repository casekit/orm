import { Schema } from "~/types/schema";
import { SchemaDefinition } from "~/types/schema/definition/SchemaDefinition";

import { populateConfig } from "./populateConfig";
import { populateModel } from "./populateModel";

export const populateSchema = <S extends SchemaDefinition>(
    schema: S,
): Schema => {
    const config = populateConfig(schema.config);

    const models = Object.fromEntries(
        Object.entries(schema.models).map(([name, model]) => [
            name,
            populateModel(config, name, model),
        ]),
    );

    return {
        config,
        models,
    };
};
