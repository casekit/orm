import { handler } from "./db-drop/handler.js";
import { builder } from "./db-drop/options.js";

export const dbDrop = {
    command: "drop",
    desc: "Drop the database schemas used by your models",
    builder,
    handler,
};
