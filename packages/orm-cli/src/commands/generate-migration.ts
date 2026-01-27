import { handler } from "./generate-migration/handler.js";
import { builder } from "./generate-migration/options.js";

export const generateMigration = {
    command: "migration",
    desc: "Generate a new migration from schema changes",
    builder,
    handler,
};
