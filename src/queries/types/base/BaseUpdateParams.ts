import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { NonEmptyArray } from "../../../types/util/NonEmptyArray";
import { WhereClause } from "../WhereClause";

export type BaseUpdateParams = {
    update: Record<string, unknown | null>;
    where: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
    returning?: NonEmptyArray<string>;
};
