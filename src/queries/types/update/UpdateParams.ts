import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../ReturningClause";
import { WhereClause } from "../WhereClause";

export type UpdateParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    update: { [C in ColumnName<Models, M>]?: ColumnType<Models, M, C> };
    where: WhereClause<Models, M>;
    returning?: ReturningClause<Models, M>;
};
