import { ConnectionConfig } from "pg";
import { ArgumentsCamelCase, InferredOptionTypes, Options } from "yargs";

import { Orm } from "@casekit/orm";

import { globalOptions } from "#options.js";

export interface OrmCLIConfig {
    db: Orm;
    directory: string;
    migrate?: {
        connection?: ConnectionConfig;
        migrationsPath?: string;
    };
}

export type Builder = Record<string, Options>;

export type CommandOptions<T extends Builder = Record<string, never>> =
    ArgumentsCamelCase<InferredOptionTypes<T & typeof globalOptions>>;

export type Handler<T extends Builder = Record<string, never>> = (
    opts: ArgumentsCamelCase<InferredOptionTypes<T & typeof globalOptions>>,
) => void | Promise<void>;
