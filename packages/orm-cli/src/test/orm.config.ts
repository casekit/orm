import { orm } from "@casekit/orm";
import { type OrmCLIConfig } from "@casekit/orm-cli";
import { config } from "@casekit/orm-fixtures";

export default {
    db: orm({ ...config, schema: "orm_cli_test" }),
    directory: "./app/db.server",
} satisfies OrmCLIConfig;
