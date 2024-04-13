import { $gt, $gte, $in, $lt, $lte } from "../operators";

export type NumberOperators<T extends number> =
    | { [$gt]: T }
    | { [$lt]: T }
    | { [$gte]: T }
    | { [$lte]: T }
    | { [$in]: T[] };
