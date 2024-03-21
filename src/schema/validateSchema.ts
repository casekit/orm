import { Schema } from "~/types/schema";

import { validateModel } from "./validateModel";

export const validateSchema = (schema: Schema) => {
    for (const [name, model] of Object.entries(schema.models)) {
        validateModel(schema, name, model);
    }
};
