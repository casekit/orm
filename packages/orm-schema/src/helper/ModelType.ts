import { Simplify } from "@casekit/toolbox";

import { ModelDefinition } from "#definition/ModelDefinition.js";
import { FieldType } from "./FieldType.js";

export type ModelType<Model extends ModelDefinition> = Simplify<{
    [C in keyof Model["fields"]]: FieldType<Model, C>;
}>;
