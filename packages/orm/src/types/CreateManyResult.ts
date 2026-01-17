import { FieldType, ModelDefinitions, ModelName } from "@casekit/orm-schema";

import { CreateManyParams } from "./CreateManyParams.js";

export type CreateManyResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    Q extends CreateManyParams<Models, M>,
> =
    Q["returning"] extends NonNullable<Q["returning"]>
        ? { [C in Q["returning"][number]]: FieldType<Models[M], C> }[]
        : number;
