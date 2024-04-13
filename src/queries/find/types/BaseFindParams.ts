import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LateralByClause } from "../../clauses/LateralByClause";
import { WhereClause } from "../../clauses/WhereClause";

export type BaseFindParams = {
    select: string[];
    include?: Partial<Record<string, BaseFindParams>>;
    where?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
    limit?: number;
    offset?: number;
    lateralBy?: LateralByClause;
    orderBy?: (string | [string, "asc" | "desc"])[];
};
