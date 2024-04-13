import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../../clauses/ReturningClause";
import { CreateValues } from "./CreateOneParams";

export type CreateManyParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    values: CreateValues<Models, M>[];
    returning?: ReturningClause<Models, M>;
};
