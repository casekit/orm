import { handler } from "./generate-model/handler.js";
import { builder } from "./generate-model/options.js";

export const generateModel = {
    command: "model",
    desc: "Generate a skeleton model file",
    builder,
    handler,
};
