import { DeepReadonly } from "ts-essentials";

import { ModelDefinitions, ModelName } from "@casekit/orm-schema";

import { CreateValues } from "./CreateValues.js";
import { ReturningClause } from "./ReturningClause.js";

export type CreateOneParams<
    Models extends ModelDefinitions,
    M extends ModelName<ModelDefinitions>,
> = {
    values: DeepReadonly<CreateValues<Models[M]>>;
    returning?: ReturningClause<Models[M]>;
    onConflict?: {
        do: "nothing";
    };
};
