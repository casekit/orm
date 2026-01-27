import { handler } from "./db-migrate-status/handler.js";
import { builder } from "./db-migrate-status/options.js";

export const dbMigrateStatus = {
    command: "status",
    desc: "Show migration status",
    builder,
    handler,
};
