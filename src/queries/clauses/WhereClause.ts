import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../schema/types/helpers/ColumnName";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { NonEmptyArray } from "../../types/util/NonEmptyArray";
import { $and, $not, $or } from "../clauses/where/operators";
import { WhereClauseValue } from "./where/types/WhereClauseValue";

export type WhereClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    | {
          [C in ColumnName<Models, M>]?: WhereClauseValue<Models, M, C>;
      }
    | { [$and]: NonEmptyArray<WhereClause<Models, M>> }
    | { [$or]: NonEmptyArray<WhereClause<Models, M>> }
    | { [$not]: WhereClause<Models, M> };
