import { ForeignKey } from "../constraints/ForeignKey";
import { UniqueConstraint } from "../constraints/UniqueConstraint";
import { ColumnDefinition } from "./ColumnDefinition";

/**
 * Configuration object for a database model.
 */
export type ModelDefinition = {
    /**
     * The name of the model's table. If not specified, the table name will be
     * derived from the model name, with any transform function specified in
     * config applied.
     */
    table?: string;

    /**
     * The schema in which the model sits. If not specified, will use the
     * schema specified in the global config; if no schema is specified in
     * the global config, will be set to `public`.
     */
    schema?: string;

    /**
     * The model's column configuration - a map of field name to column
     * definitions. The keys of this map will be used in generated functions
     * and object fields, so must be valid Javascript identifiers.
     */
    columns: Record<string, ColumnDefinition>;

    /**
     * If the table's primary key contains multiple columns, specify them here.
     * If the primary key is on a single column, you can specify it here or in the column definition.
     */
    primaryKey?: string[];

    /**
     * If the table has unique constraints that span multiple columns, you must specify them here.
     * If the unique constraint is on a single column, you can specify it here or in the column definition.
     */
    uniqueConstraints?: UniqueConstraint[];

    /**
     * If the table has foreign keys, you must specify them here. If the foreign key is on a single column,
     * you can specify it here or in the column definition.
     */
    foreignKeys?: ForeignKey[];
};
