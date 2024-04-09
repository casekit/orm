import { $and, $not, $or } from "../../queries/where/operators";
import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { ColumnName } from "../schema/helpers/ColumnName";
import { ModelName } from "../schema/helpers/ModelName";
import { NonEmptyArray } from "../util/NonEmptyArray";
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
