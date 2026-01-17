import pg from "pg";

import { Logger } from "./Logger.js";
import { ModelDefinitions } from "./definition/ModelDefinitions.js";
import { OperatorDefinitions } from "./definition/OperatorDefinitions.js";

export interface Config {
    readonly schema?: string;
    readonly models: ModelDefinitions;
    readonly operators?: OperatorDefinitions;
    readonly extensions?: readonly string[];
    readonly connection?:
        | pg.ConnectionConfig
        | pg.PoolConfig
        | pg.PoolOptions
        | null;
    readonly pool?: boolean;
    readonly logger?: Logger;
    readonly naming?: {
        readonly column?: (name: string) => string;
        readonly table?: (name: string) => string;
    };
}
