import pg from "pg";

import { ModelDefinitions } from "./schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "./schema/definitions/RelationsDefinitions";

export type Configuration<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = {
    models: Models;
    relations?: Relations;
    extensions?: string[];
    schema?: string;
    naming?: {
        column?: (s: string) => string;
        table?: (s: string) => string;
    };
    connection?: pg.PoolConfig;
};
