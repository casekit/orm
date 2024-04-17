import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { WhereClause } from "../../clauses/WhereClause";

export type BaseCountParams = {
    include?: Partial<Record<string, BaseCountParams>>;
    where?: WhereClause<
        LooseModelDefinitions,
        ModelName<LooseModelDefinitions>
    >;
};
