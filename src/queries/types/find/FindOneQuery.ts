import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { IncludeClause } from "../IncludeClause";
import { SelectClause } from "../SelectClause";
import { WhereClause } from "../WhereClause";

export type FindOneParams<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    select: SelectClause<Models, M>;
    where?: WhereClause<Models, M>;
    include?: IncludeClause<Models, Relations, M>;
};
