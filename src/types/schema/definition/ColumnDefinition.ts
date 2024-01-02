import { z } from "zod";

import { DataType } from "../postgres/DataType";

export type ColumnDefinition<ColumnSchema = unknown> = {
    name?: string;
    /**
     * A Zod schema used to infer the type of the column and to
     * validate/transform data coming from the database.
     */
    schema: z.ZodType<ColumnSchema>;
    type: DataType;
    nullable?: boolean;
    primaryKey?: boolean;
    unique?: boolean;
};
