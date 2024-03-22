import { z } from "zod";
import { SQLFragment } from "~/util/SqlFragment";

import { DataType } from "../postgres/DataType";

export type ColumnDefinition<ColumnType = unknown> = {
    name?: string;
    /**
     * A Zod schema used to infer the type of the column and to
     * validate/transform data coming from the database.
     */
    schema: z.ZodType<ColumnType>;
    type: DataType;
    nullable?: boolean;
    primaryKey?: boolean;
    unique?: boolean;
    default?: ColumnType | SQLFragment | null;
};
