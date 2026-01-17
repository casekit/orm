import { handler } from "./db-pull/handler.js";
import { builder } from "./db-pull/options.js";

export const dbPull = {
    command: "pull",
    desc: "Introspect and pull the current schema from the database",
    builder,
    handler,
};
