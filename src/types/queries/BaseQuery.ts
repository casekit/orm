import { NonEmptyArray } from "../util/NonEmptyArray";

export type BaseQuery = {
    select: NonEmptyArray<string>;
    include?: Partial<Record<string, BaseQuery>>;
    limit?: number;
    offset?: number;
};
