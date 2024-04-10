import { $gt, $gte, $in, $lt, $lte } from "../../../queries/where/operators";

export type NumberOperators<T extends number> =
    | { [$gt]: T }
    | { [$lt]: T }
    | { [$gte]: T }
    | { [$lte]: T }
    | { [$in]: T[] };
