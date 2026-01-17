import { FieldDefinition } from "./FieldDefinition.js";
import { ForeignKeyDefinition } from "./ForeignKeyDefinition.js";
import { RelationDefinitions } from "./RelationDefinitions.js";
import { UniqueConstraintDefinition } from "./UniqueConstraintDefinition.js";

/**
 * Configuration object for a database model.
 */
export interface ModelDefinition {
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
     * The model's fields - a map of field name to field
     * definitions. The keys of this map will be used in generated functions
     * and object fields, so must be valid Javascript identifiers.
     */
    fields: Record<string, FieldDefinition>;

    /**
     * If the table's primary key contains multiple columns, specify them here.
     * If the primary key is on a single column, you can specify it here or in the column definition.
     */
    primaryKey?: string[] | null;

    /**
     * If the table has unique constraints that span multiple columns, you must specify them here.
     * If the unique constraint is on a single column, you can specify it here or in the column definition.
     */
    uniqueConstraints?: UniqueConstraintDefinition[];

    /**
     * If the table has foreign keys, you must specify them here. If the foreign key is on a single column,
     * you can specify it here or in the column definition.
     */
    foreignKeys?: ForeignKeyDefinition[];

    relations?: RelationDefinitions;
}
