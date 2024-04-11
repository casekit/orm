import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../ReturningClause";
import { OptionalParams } from "../helpers/OptionalParams";
import { RequiredParams } from "../helpers/RequiredParams";

export type CreateManyParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    data: (RequiredParams<Models, M> & OptionalParams<Models, M>)[];
    returning?: ReturningClause<Models, M>;
};
