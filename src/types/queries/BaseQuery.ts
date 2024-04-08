import { NonEmptyArray } from "../util/NonEmptyArray";
import { LateralByClause } from "./LateralByClause";

export type BaseQuery = {
    select: NonEmptyArray<string>;
    include?: Partial<Record<string, BaseQuery>>;
    limit?: number;
    offset?: number;
    lateralBy?: LateralByClause;
};
