import { ColumnName } from "../../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../../schema/types/loose/LooseModelDefinitions";
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
    $search,
} from "../operators";

export type WhereClauseValue<
    Models extends LooseModelDefinitions,
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
          [$search]?: string;
      };
