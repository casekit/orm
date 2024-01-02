import { NonEmptyArray } from "../util/NonEmptyArray";

export type BaseQuery = {
    select: NonEmptyArray<string>;
};
