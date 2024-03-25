import { SQLStatement } from "../../..";
import { NonEmptyArray } from "../../util/NonEmptyArray";
import { ColumnDefinition } from "./ColumnDefinition";

export type UniqueConstraint<
    Columns extends Record<string, ColumnDefinition> = Record<
        string,
        ColumnDefinition
    >,
> = {
    name?: string;
    columns: NonEmptyArray<Extract<keyof Columns, string>>;
    where?: SQLStatement;
};
