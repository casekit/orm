import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type BaseCreateManyParams = {
    values: Record<string, unknown | null>[];
    returning?: NonEmptyArray<string>;
};
