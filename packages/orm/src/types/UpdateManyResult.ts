import {
    FieldType,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { UpdateParams } from "./UpdateParams.js";

export type UpdateManyResult<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    Q extends UpdateParams<Models, Operators, M>,
> =
    Q["returning"] extends NonNullable<Q["returning"]>
        ? { [C in Q["returning"][number]]: FieldType<Models[M], C> }[]
        : number;
