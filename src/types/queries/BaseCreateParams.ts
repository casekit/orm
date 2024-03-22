import { NonEmptyArray } from "../util/NonEmptyArray";

export type BaseCreateParams = {
    data: Record<string, unknown | null>;
    returning?: NonEmptyArray<string>;
};
