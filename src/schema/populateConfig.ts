import { identity } from "lodash";
import { DeepRequired } from "~/types/util/DeepRequired";

import { Config } from "../types/Config";

export const populateConfig = (config: Config = {}): DeepRequired<Config> => ({
    ...config,
    schema: config.schema ?? "public",
    naming: {
        ...config.naming,
        table: config.naming?.table ?? identity,
        column: config.naming?.column ?? identity,
    },
});
