import { SQLStatement } from "../../..";
import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

export type UniqueConstraint = {
    name?: string;
    columns: NonEmptyArray<string>;
    where?: SQLStatement;
    nullsNotDistinct?: boolean;
};
