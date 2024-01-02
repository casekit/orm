import { ColumnDefinition } from "./ColumnDefinition";

/**
 * Configuration object for a database model.
 */
export type ModelDefinition<
    Columns extends Record<string, ColumnDefinition> = Record<
        string,
        ColumnDefinition
    >,
> = {
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
    columns: Columns;
};
