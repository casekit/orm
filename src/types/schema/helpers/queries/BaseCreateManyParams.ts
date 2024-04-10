import { NonEmptyArray } from "../../../util/NonEmptyArray";

export type BaseCreateManyParams = {
    data: Record<string, unknown | null>[];
    returning?: NonEmptyArray<string>;
};
