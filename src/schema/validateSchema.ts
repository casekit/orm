import { PopulatedSchema } from "../types/schema";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";
import { validateModel } from "./validateModel";

export const validateSchema = <Models extends ModelDefinitions>(
    schema: PopulatedSchema<Models>,
) => {
    for (const [name, model] of Object.entries(schema.models)) {
        validateModel(schema, name, model);
    }
};
