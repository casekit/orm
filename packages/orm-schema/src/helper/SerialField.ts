import { ModelDefinition } from "../definition/ModelDefinition.js";

export type SerialField<Model extends ModelDefinition> = {
    [K in keyof Model["fields"]]: Uppercase<Model["fields"][K]["type"]> extends
        | "SMALLSERIAL"
        | "SERIAL"
        | "BIGSERIAL"
        ? K
        : never;
}[keyof Model["fields"]];
