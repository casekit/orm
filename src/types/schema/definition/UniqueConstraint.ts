import { SQLStatement } from "../../..";
import { NonEmptyArray } from "../../util/NonEmptyArray";

export type UniqueConstraint = {
    name?: string;
    columns: NonEmptyArray<string>;
    where?: SQLStatement;
    nullsNotDistinct?: boolean;
};
