import pg from "pg";

import { Middleware } from "../queries/middleware/Middleware";
import { ModelDefinitions } from "../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/types/definitions/RelationsDefinitions";

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
    middleware?: Middleware[];
};
