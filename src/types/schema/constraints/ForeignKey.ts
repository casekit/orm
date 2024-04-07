import { SQLStatement } from "../../..";
import { NonEmptyArray } from "../../util/NonEmptyArray";

export type ForeignKey = {
    columns: NonEmptyArray<string>;
    references: {
        schema?: string;
        table: string;
        columns: NonEmptyArray<string>;
    };
    onUpdate?: SQLStatement;
    onDelete?: SQLStatement;
};
