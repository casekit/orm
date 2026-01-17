import "dotenv/config";

import { orm } from "@casekit/orm";
import type { OrmCLIConfig } from "@casekit/orm-cli";
import { config } from "@casekit/orm-fixtures";

export default {
    db: orm(config),
    directory: "./src/db.server",
} satisfies OrmCLIConfig;
