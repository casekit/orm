import { Union } from "ts-toolbelt";
import { AtLeast } from "ts-toolbelt/out/Object/AtLeast";

import { ModelDefinitions } from "../../../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../../schema/types/helpers/ModelName";
import { $eq, $ne, $not } from "../operators";
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
