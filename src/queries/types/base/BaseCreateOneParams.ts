import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type BaseCreateOneParams = {
    data: Record<string, unknown | null>;
    returning?: NonEmptyArray<string>;
};
