import { NonEmptyArray } from "../../../util/NonEmptyArray";

export type BaseCreateOneParams = {
    data: Record<string, unknown | null>;
    returning?: NonEmptyArray<string>;
};
