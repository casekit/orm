import {
    $gt,
    $gte,
    $ilike,
    $in,
    $like,
    $lt,
    $lte,
} from "../../where/operators";

export type StringOperators<T extends string> =
    | { [$gt]: T }
    | { [$lt]: T }
    | { [$gte]: T }
    | { [$lte]: T }
    | { [$in]: T[] }
    | { [$like]: T }
    | { [$ilike]: T };
