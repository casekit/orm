import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../ReturningClause";
import { OptionalParams } from "../helpers/OptionalParams";
import { RequiredParams } from "../helpers/RequiredParams";

export type CreateValues<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = RequiredParams<Models, M> & OptionalParams<Models, M>;

export type CreateOneParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    values: CreateValues<Models, M>;
    returning?: ReturningClause<Models, M>;
};
