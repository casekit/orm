import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { LateralByClause } from "./LateralByClause";
import { WhereClause } from "./WhereClause";

export type BaseQuery = {
    select: string[];
    include?: Partial<Record<string, BaseQuery>>;
    where?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
    limit?: number;
    offset?: number;
    lateralBy?: LateralByClause;
    orderBy?: (string | [string, "asc" | "desc"])[];
};