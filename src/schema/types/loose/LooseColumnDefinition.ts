import { z } from "zod";

import { SQLStatement } from "../../../sql";
import { DataType } from "../postgres/DataType";

export type LooseColumnDefinition<ColumnType = unknown> = {
    /**
     * The postgresql datatype of the column.
     */
    type: DataType;

    /**
     * The name of the column in the database. If not specified,
     * it will be inferred based on the model's field name,
     * with any column naming function (e.g. `snakeCase`) specified
     * in the config applied.
     */
    name?: string;

    /**
     * A Zod schema used to infer the type of the column and to
     * validate/transform data coming from the database.
     * If not specified, a basic schema will be inferred based on the
     * postgresql data type of the column. Specifying it
     * allows to you configure more sophisticated parsing, validation,
     * and transformations.
     */
    zodSchema?: z.ZodType<ColumnType>;

    /**
     * Are null values allowed in this column?
     */
    nullable?: boolean;

    /**
     * Does this column have a default value? This can be either a value such as a number or string,
     * or if you want to specify a SQL function for the default, you can use the `sql` tagged
     * template literal. So examples would include:
     *
     * default: 3,
     *
     * or
     *
     * default: "foo",
     *
     * or
     *
     * default: sql`uuid_generate_v4()`,
     */
    default?: ColumnType | SQLStatement | null;

    /**
     * Is this column unique? If so, you can specify a where clause to
     * specify a partial unique index, and whether nulls should be considered
     * distinct.
     */
    unique?: boolean | { where?: SQLStatement; nullsNotDistinct?: boolean };

    /**
     * Is this column a single-column primary key?
     */
    primaryKey?: boolean;

    /**
     * Is this column a foreign key? If so, you can specify the table and column it references,
     * and what should happen on update or delete.
     */
    references?: {
        schema?: string;
        table: string;
        column: string;
        onUpdate?: SQLStatement;
        onDelete?: SQLStatement;
    };
};
