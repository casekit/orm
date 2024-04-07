import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { validateModel } from "./validateModel";

export const validateConfiguration = (config: BaseConfiguration) => {
    for (const [name, model] of Object.entries(config.models)) {
        validateModel(config, name, model);
    }
};
