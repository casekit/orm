import { handler } from "./db-migrate/handler.js";
import { builder } from "./db-migrate/options.js";

export const dbMigrate = {
    command: "migrate",
    desc: "Run pending migrations",
    builder,
    handler,
};
