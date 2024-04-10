import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../definitions/RelationsDefinitions";
import { ModelName } from "../ModelName";
import { IncludeClause } from "./IncludeClause";
import { SelectClause } from "./SelectClause";
import { WhereClause } from "./WhereClause";

export type FindOneQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
    where?: WhereClause<Models, M>;
    include?: IncludeClause<Models, Relations, M>;
};
