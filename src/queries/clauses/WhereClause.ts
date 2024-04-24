import { ColumnName } from "../../schema/types/helpers/ColumnName";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { $and, $not, $or } from "../clauses/where/operators";
import { WhereClauseValue } from "./where/types/WhereClauseValue";

export type WhereClause<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = {
    [C in ColumnName<Models[M]>]?: WhereClauseValue<Models, M, C>;
} & {
    [$and]?: WhereClause<Models, M>[];
    [$or]?: WhereClause<Models, M>[];
    [$not]?: WhereClause<Models, M>;
};
