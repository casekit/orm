import { handler } from "./db-push/handler.js";
import { builder } from "./db-push/options.js";

export const dbPush = {
    command: "push",
    desc: "Forcibly push the current schema to the database",
    builder,
    handler,
};
