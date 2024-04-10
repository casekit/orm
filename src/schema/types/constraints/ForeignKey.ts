import { SQLStatement } from "../../..";
import { NonEmptyArray } from "../../../types/util/NonEmptyArray";

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
