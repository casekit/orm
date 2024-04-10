import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { SelectClause } from "../SelectClause";
import { OptionalParams } from "../helpers/OptionalParams";
import { RequiredParams } from "../helpers/RequiredParams";

export type CreateOneParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    data: RequiredParams<Models, M> & OptionalParams<Models, M>;
    returning?: SelectClause<Models, M>;
};
