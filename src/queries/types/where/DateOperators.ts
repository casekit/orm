import { $gt, $gte, $in, $lt, $lte } from "../../where/operators";

export type DateOperators<T extends Date> =
    | { [$gt]: T }
    | { [$lt]: T }
    | { [$gte]: T }
    | { [$lte]: T }
    | { [$in]: T[] };
