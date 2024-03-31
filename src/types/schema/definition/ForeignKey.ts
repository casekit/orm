import { NonEmptyArray } from "../../util/NonEmptyArray";

export type ForeignKey = {
    columns: NonEmptyArray<string>;
    references: string;
    on: string[];
};
