import { LateralByClause } from "./LateralByClause";

export type BaseQuery = {
    select: string[];
    include?: Partial<Record<string, BaseQuery>>;
    limit?: number;
    offset?: number;
    lateralBy?: LateralByClause;
};
