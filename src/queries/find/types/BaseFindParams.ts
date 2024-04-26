import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LateralByClause } from "../../clauses/LateralByClause";
import { WhereClause } from "../../clauses/WhereClause";

export type BaseFindParams = {
    select: string[];
    include?: Partial<Record<string, Omit<BaseFindParams, "for">>>;
    where?: WhereClause<
        LooseModelDefinitions,
        ModelName<LooseModelDefinitions>
    >;
    limit?: number;
    offset?: number;
    lateralBy?: LateralByClause;
    for?: "update" | "no key update" | "share" | "key share";
    orderBy?: (string | [string, "asc" | "desc"])[];
};
