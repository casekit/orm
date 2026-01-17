import { DeepReadonly } from "ts-essentials";

import {
    FieldName,
    FieldType,
    ModelDefinition,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import {
    $and,
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
    $or,
} from "#operators.js";

export interface DefaultOperators<T> {
    [$eq]?: DeepReadonly<T>;
    [$ne]?: DeepReadonly<T>;
    [$not]?: null | true | false;
    [$is]?: null | true | false;
    [$gt]?: DeepReadonly<T>;
    [$gte]?: DeepReadonly<T>;
    [$lt]?: DeepReadonly<T>;
    [$lte]?: DeepReadonly<T>;
    [$in]?: DeepReadonly<T[]>;
    [$like]?: string;
    [$ilike]?: string;
}

// i don't have a great understanding of why, but the special-case for arrays
// in this type check prevents arrays from breaking the update and delete return types.
// without this, updates and deletes with array values in the where clause would
// return a number even if a returning clause is specified
export type ReadonlyArrays<T> = T extends (infer E)[]
    ? readonly E[]
    : T extends Date
      ? Date
      : T extends object
        ? { readonly [K in keyof T]: ReadonlyArrays<T[K]> }
        : T;

export type WhereClauseValue<
    Model extends ModelDefinition,
    Operators extends OperatorDefinitions,
    C extends FieldName<Model>,
    T = DeepReadonly<FieldType<Model, C>>,
> =
    | DeepReadonly<T>
    | null
    | DefaultOperators<T>
    | (Operators["where"] extends never
          ? never
          : {
                [K in Extract<keyof Operators["where"], symbol>]?: Parameters<
                    NonNullable<Operators["where"]>[K]
                >[1];
            });

export type WhereClause<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    _Model extends ModelDefinition = Models[M],
> = {
    [C in FieldName<_Model>]?: WhereClauseValue<_Model, Operators, C>;
} & {
    [$and]?: Array<WhereClause<Models, Operators, M>>;
    [$or]?: Array<WhereClause<Models, Operators, M>>;
    [$not]?: WhereClause<Models, Operators, M>;
};
