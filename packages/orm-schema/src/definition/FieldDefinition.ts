import { z } from "zod";

import { SQLStatement } from "@casekit/sql";

import { PostgresDataTypes } from "./PostgresDataTypes.js";

export interface FieldDefinition {
    /**
     * The name of the column in the database. If not specified,
     * it will be inferred based on the model's field name,
     * with any column naming function (e.g. `snakeCase`) specified
     * in the config applied.
     */
    column?: string;

    /**
     * The postgresql datatype of the column.
     */
    type:
        | `${PostgresDataTypes[keyof PostgresDataTypes]}${string}` // the string at the end allows for arrays
        | `${Uppercase<PostgresDataTypes[keyof PostgresDataTypes]>}${string}`;

    /**
     * A Zod schema used to infer the type of the column and to
     * validate/transform data coming from the database.
     * If not specified, an attempt will be made to infer a basic schema
     * based on the postgresql data type of the column. Specifying it
     * allows to you configure more sophisticated parsing, validation,
     * and transformations.
     */
    zodSchema?: z.ZodType;

    /**
     * Are null values allowed in this column?
     */
    nullable?: boolean;

    /**
     * The default value for this column, if it has one. This can be either a value such
     * as a number or string, or if you want to specify a SQL function for the default,
     * you can use the `sql` tagged template literal. Examples include:
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
    default?: unknown;

    /**
     * Is this column unique? If so, you can specify a where clause to
     * specify a partial unique index, and whether nulls should be considered
     * distinct.
     */
    unique?:
        | boolean
        | { where?: SQLStatement | null; nullsNotDistinct?: boolean };

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
        model: string;
        field: string;
        onUpdate?: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT" | null;
        onDelete?: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT" | null;
    } | null;

    /**
     * Is this column provided by middleware? If so, it will not be included in
     * the set of required columns for inserts and updates.
     */

    provided?: boolean;
}
