import { ModelDefinition } from "..";
import { PopulatedSchema } from "../types/schema";
import { validateModel } from "./validateModel";

export const validateSchema = <Models extends Record<string, ModelDefinition>>(
    schema: PopulatedSchema<Models>,
) => {
    for (const [name, model] of Object.entries(schema.models)) {
        validateModel(schema, name, model);
    }
};
