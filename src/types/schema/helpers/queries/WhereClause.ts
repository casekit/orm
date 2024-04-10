import { $and, $not, $or } from "../../../../queries/where/operators";
import { NonEmptyArray } from "../../../util/NonEmptyArray";
import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnName } from "../ColumnName";
import { ModelName } from "../ModelName";
import { WhereClauseValue } from "./where/WhereClauseValue";

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
