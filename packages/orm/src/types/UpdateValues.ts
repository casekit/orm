import { DeepReadonly } from "ts-essentials";

import { FieldName, FieldType, ModelDefinition } from "@casekit/orm-schema";
import { Simplify } from "@casekit/toolbox";

export type UpdateValues<Model extends ModelDefinition> = DeepReadonly<
    Simplify<{
        [K in FieldName<Model>]?: FieldType<Model, K>;
    }>
>;
