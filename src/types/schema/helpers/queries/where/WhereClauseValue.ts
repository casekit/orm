import { Union } from "ts-toolbelt";
import { AtLeast } from "ts-toolbelt/out/Object/AtLeast";

import { $eq, $ne, $not } from "../../../../../queries/where/operators";
import { ModelDefinitions } from "../../../definitions/ModelDefinitions";
import { ColumnName } from "../../ColumnName";
import { ColumnType } from "../../ColumnType";
import { ModelName } from "../../ModelName";
import { BooleanOperators } from "./BooleanOperators";
import { DateOperators } from "./DateOperators";
import { NumberOperators } from "./NumberOperators";
import { StringOperators } from "./StringOperators";

export type WhereClauseValue<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models, M>,
    T = ColumnType<Models, M, C>,
> =
    | ColumnType<Models, M, C>
    | null
    | AtLeast<
          Union.Merge<
              | { [$eq]: T }
              | { [$ne]: T }
              | { [$not]: null }
              | (T extends boolean ? BooleanOperators : never)
              | (T extends number ? NumberOperators<T> : never)
              | (T extends string ? StringOperators<T> : never)
              | (T extends Date ? DateOperators<T> : never)
          >
      >;
