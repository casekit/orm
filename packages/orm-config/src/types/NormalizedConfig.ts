import pg from "pg";

import { Logger, OperatorDefinitions } from "@casekit/orm-schema";

import { NormalizedModelDefinition } from "./NormalizedModelDefinition.js";

export interface NormalizedConfig {
    readonly schema: string;
    readonly models: Record<string, NormalizedModelDefinition>;
    readonly operators: OperatorDefinitions;
    readonly extensions: readonly string[];
    readonly connection:
        | pg.ConnectionConfig
        | pg.PoolConfig
        | pg.PoolOptions
        | null;
    readonly pool: boolean;
    readonly logger: Logger;
    readonly naming: {
        readonly column: (name: string) => string;
        readonly table: (name: string) => string;
    };
}
