import {
    FieldType,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { DeleteParams } from "./DeleteParams.js";

export type DeleteOneResult<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    Q extends DeleteParams<Models, Operators, M>,
> =
    Q["returning"] extends NonNullable<Q["returning"]>
        ? { [C in Q["returning"][number]]: FieldType<Models[M], C> }
        : number;
