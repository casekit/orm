import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LateralByClause } from "../../clauses/LateralByClause";
import { WhereClause } from "../../clauses/WhereClause";

export type BaseFindParams = {
    select: string[];
    include?: Partial<Record<string, BaseFindParams>>;
    where?: WhereClause<
        LooseModelDefinitions,
        ModelName<LooseModelDefinitions>
    >;
    limit?: number;
    offset?: number;
    lateralBy?: LateralByClause;
    orderBy?: (string | [string, "asc" | "desc"])[];
};
