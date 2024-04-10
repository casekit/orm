import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ModelName } from "../ModelName";
import { OptionalParams } from "./OptionalParams";
import { RequiredParams } from "./RequiredParams";
import { SelectClause } from "./SelectClause";

export type CreateOneParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    data: RequiredParams<Models, M> & OptionalParams<Models, M>;
    returning?: SelectClause<Models, M>;
};
