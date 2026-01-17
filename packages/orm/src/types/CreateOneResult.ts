import { FieldType, ModelDefinitions, ModelName } from "@casekit/orm-schema";

import { CreateOneParams } from "./CreateOneParams.js";

export type CreateOneResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    Q extends CreateOneParams<Models, M>,
> =
    Q["returning"] extends NonNullable<Q["returning"]>
        ? Q["onConflict"] extends { do: "nothing" }
            ? { [C in Q["returning"][number]]: FieldType<Models[M], C> } | null
            : { [C in Q["returning"][number]]: FieldType<Models[M], C> }
        : number;
