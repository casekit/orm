import { identity } from "lodash";

import { Config } from "../types/Config";

export type PartialConfig = {
    naming?: Partial<Config["naming"]>;
    schema?: Config["schema"];
    connection?: Config["connection"];
};

export const createConfig = (config: PartialConfig = {}): Config => ({
    ...config,
    schema: config.schema ?? "public",
    naming: {
        ...config.naming,
        table: config.naming?.table ?? identity,
        column: config.naming?.column ?? identity,
    },
});
