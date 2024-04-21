import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type BaseCreateOneParams = {
    values: Record<string, unknown | null>;
    onConflict?: { do: "nothing" };
    returning?: NonEmptyArray<string>;
};
