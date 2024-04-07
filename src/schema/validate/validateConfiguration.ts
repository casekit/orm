import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { validateModel } from "./validateModel";

export const validateConfiguration = (schema: BaseConfiguration) => {
    for (const [name, model] of Object.entries(schema.models)) {
        validateModel(schema, name, model);
    }
};
