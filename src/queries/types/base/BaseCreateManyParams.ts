import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type BaseCreateManyParams = {
    data: Record<string, unknown | null>[];
    returning?: NonEmptyArray<string>;
};
