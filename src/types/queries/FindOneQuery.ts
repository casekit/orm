import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type FindOneQuery<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
};
