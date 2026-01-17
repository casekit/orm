import { DeepReadonly } from "ts-essentials";

import { ModelDefinition } from "@casekit/orm-schema";
import { Simplify } from "@casekit/toolbox";

import { OptionalValues } from "./OptionalValues.js";
import { RequiredValues } from "./RequiredValues.js";

export type CreateValues<Model extends ModelDefinition> = DeepReadonly<
    Simplify<
        RequiredValues<Model> extends never
            ? OptionalValues<Model>
            : OptionalValues<Model> extends never
              ? RequiredValues<Model>
              : RequiredValues<Model> & OptionalValues<Model>
    >
>;
