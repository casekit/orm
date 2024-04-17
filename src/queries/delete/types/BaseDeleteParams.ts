import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { NonEmptyArray } from "../../../types/util/NonEmptyArray";
import { WhereClause } from "../../clauses/WhereClause";

export type BaseDeleteParams = {
    where: WhereClause<LooseModelDefinitions, ModelName<LooseModelDefinitions>>;
    returning?: NonEmptyArray<string>;
};
