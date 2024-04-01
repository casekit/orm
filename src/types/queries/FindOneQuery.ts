import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ModelName2 } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type FindOneQuery<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = {
    select: SelectClause<Models, M>;
};
