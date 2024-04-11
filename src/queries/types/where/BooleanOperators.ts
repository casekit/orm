import { $is, $not } from "../../where/operators";

export type BooleanOperators =
    | { [$is]: null }
    | { [$is]: { [$not]: null } }
    | { [$is]: false }
    | { [$is]: true }
    | { [$is]: { [$not]: true } }
    | { [$is]: { [$not]: false } };
