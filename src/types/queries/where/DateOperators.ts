import { $gt, $gte, $in, $lt, $lte } from "../../../queries/where/operators";

export type DateOperators<T extends Date> =
    | { [$gt]: T }
    | { [$lt]: T }
    | { [$gte]: T }
    | { [$lte]: T }
    | { [$in]: T[] };
