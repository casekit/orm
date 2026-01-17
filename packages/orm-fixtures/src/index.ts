import { snakeCase } from "es-toolkit";

import { Config } from "@casekit/orm-schema";

import { models } from "./models/index.js";

export { models } from "./models/index.js";

export type Models = typeof models;
export type Operators = { where: Record<symbol, never> };

export const config = {
    schema: "orm",
    models,
    naming: {
        table: snakeCase,
        column: snakeCase,
    },
    extensions: ["uuid-ossp"],
    pool: true,
} satisfies Config;
