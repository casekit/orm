import { type Config, orm } from "@casekit/orm";
import type { OrmCLIConfig } from "@casekit/orm-cli";
import { snakeCase } from "es-toolkit";

import { models } from "./src/db/models";

const config = {
    connection: {
        "database": "tanstack_start_example"
    },
    models,
    "naming": {
        column: snakeCase
    }
} as const satisfies Config;

export default {
    db: orm(config),
    directory: "./src/db",
} satisfies OrmCLIConfig;
