import pg from "pg";

import { Middleware } from "../queries/middleware/Middleware";
import { LooseModelDefinitions } from "../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../schema/types/loose/LooseRelationsDefinitions";

export type Configuration<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
> = {
    models: Models;
    relations?: Relations;
    extensions?: string[];
    schema?: string;
    naming?: {
        column?: (s: string) => string;
        table?: (s: string) => string;
    };
    pool: pg.Pool;
    middleware?: Middleware[];
};
