import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type BaseCreateManyParams = {
    values: Record<string, unknown | null>[];
    onConflict?: { do: "nothing" };
    returning?: NonEmptyArray<string>;
};
