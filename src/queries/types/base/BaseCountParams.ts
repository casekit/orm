import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { WhereClause } from "../WhereClause";

export type BaseCountParams = {
    include?: Partial<Record<string, BaseCountParams>>;
    where?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
};
