import { Union } from "ts-toolbelt";
import { AtLeast } from "ts-toolbelt/out/Object/AtLeast";

import { ModelDefinitions } from "../../../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../../schema/types/helpers/ModelName";
import {
    $eq,
    $gt,
    $gte,
    $ilike,
    $in,
    $is,
    $like,
    $lt,
    $lte,
    $ne,
    $not,
} from "../operators";
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
    | {
          [$eq]?: T;
          [$ne]?: T;
          [$not]?: null;
          [$is]?: null | true | false | { [$not]: true | false };
          [$gt]?: T;
          [$gte]?: T;
          [$lt]?: T;
          [$lte]?: T;
          [$in]?: T[];
          [$like]?: string;
          [$ilike]?: string;
      };
