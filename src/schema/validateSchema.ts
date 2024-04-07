import { BaseConfiguration } from "src/types/schema/BaseConfiguration";

import { validateModel } from "./validateModel";

export const validateSchema = (schema: BaseConfiguration) => {
    for (const [name, model] of Object.entries(schema.models)) {
        validateModel(schema, name, model);
    }
};
