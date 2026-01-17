import { handler } from "./init/handler.js";
import { builder } from "./init/options.js";

export const init = {
    command: "init",
    desc: "Configure your project for use with @casekit/orm",
    builder,
    handler,
};
