import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/definitions/RelationsDefinitions";
import { ModelName } from "../schema/helpers/ModelName";
import { IncludeClause } from "./IncludeClause";
import { SelectClause } from "./SelectClause";

export type FindManyQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
    include?: IncludeClause<Models, Relations, M>;
    limit?: number;
    offset?: number;
};
