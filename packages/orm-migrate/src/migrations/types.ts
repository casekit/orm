/**
 * A normalised, diffable representation of a database schema.
 * Both the TypeScript config and the pulled DB state
 * get converted into this shape before diffing.
 */
export interface SchemaSnapshot {
    schemas: string[];
    extensions: ExtensionSnapshot[];
    tables: TableSnapshot[];
}

export interface ExtensionSnapshot {
    name: string;
    schema: string;
}

export interface TableSnapshot {
    schema: string;
    name: string;
    columns: ColumnSnapshot[];
    primaryKey: PrimaryKeySnapshot;
    foreignKeys: ForeignKeySnapshot[];
    uniqueConstraints: UniqueConstraintSnapshot[];
}

export interface PrimaryKeySnapshot {
    name: string | null; // constraint name, null if no PK
    columns: string[];
}

export interface ColumnSnapshot {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
}

export interface ForeignKeySnapshot {
    name: string;
    columns: string[];
    referencesSchema: string;
    referencesTable: string;
    referencesColumns: string[];
    onDelete: string | null;
    onUpdate: string | null;
}

export interface UniqueConstraintSnapshot {
    name: string;
    columns: string[];
    nullsNotDistinct?: boolean;
    where?: string | null;
}
