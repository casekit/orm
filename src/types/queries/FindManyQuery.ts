import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type FindManyQuery<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
};
