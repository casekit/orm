import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type BaseCreateOneParams = {
    values: Record<string, unknown | null>;
    returning?: NonEmptyArray<string>;
};
