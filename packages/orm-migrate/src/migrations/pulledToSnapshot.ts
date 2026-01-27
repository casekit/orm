import type { Table } from "#pull.js";
import type { Extension } from "#pull/getExtensions.js";
import type {
    ColumnSnapshot,
    ExtensionSnapshot,
    ForeignKeySnapshot,
    SchemaSnapshot,
    TableSnapshot,
    UniqueConstraintSnapshot,
} from "./types.js";

/**
 * Extract a WHERE clause from a unique index definition string.
 * e.g. "CREATE UNIQUE INDEX idx ON schema.table (col) WHERE (active = true)"
 * returns "active = true"
 */
const extractWhereClause = (definition: string): string | null => {
    const match = /\bWHERE\s+\((.+)\)\s*$/i.exec(definition);
    return match?.[1] ?? null;
};

/**
 * Convert the Table[] and Extension[] returned by pull (the current database state)
 * into a SchemaSnapshot for diffing against the config state.
 */
export const pulledToSnapshot = (
    tables: Table[],
    pulledExtensions: Extension[] = [],
): SchemaSnapshot => {
    const schemas = [...new Set(tables.map((t) => t.schema))].sort();

    const extensions: ExtensionSnapshot[] = pulledExtensions.map((ext) => ({
        name: ext.name,
        schema: ext.schema,
    }));

    const snapshotTables: TableSnapshot[] = tables.map((table) => {
        const columns: ColumnSnapshot[] = table.columns.map((col) => ({
            name: col.column,
            type: col.isSerial ? serialType(col.type) : columnType(col),
            nullable: col.nullable,
            default: col.isSerial ? null : (col.default ?? null),
        }));

        const primaryKey = {
            name: table.primaryKey?.constraintName ?? null,
            columns: table.primaryKey?.columns ?? [],
        };

        const foreignKeys: ForeignKeySnapshot[] = table.foreignKeys.map(
            (fk) => ({
                name: fk.constraintName,
                columns: fk.columnsFrom,
                referencesSchema: fk.schema,
                referencesTable: fk.tableTo,
                referencesColumns: fk.columnsTo,
                onDelete: fk.onDelete ?? null,
                onUpdate: fk.onUpdate ?? null,
            }),
        );

        const uniqueConstraints: UniqueConstraintSnapshot[] =
            table.uniqueConstraints.map((uc) => ({
                name: uc.name,
                columns: uc.columns,
                nullsNotDistinct: uc.nullsNotDistinct,
                where: extractWhereClause(uc.definition),
            }));

        return {
            schema: table.schema,
            name: table.name,
            columns,
            primaryKey,
            foreignKeys,
            uniqueConstraints,
        };
    });

    return { schemas, extensions, tables: snapshotTables };
};

/**
 * Map serial-type columns back to their config type name.
 * When PG reports a column as integer/smallint/bigint with isSerial=true,
 * the config would have declared it as serial/smallserial/bigserial.
 */
const serialType = (pgType: string): string => {
    switch (pgType.toLowerCase()) {
        case "integer":
        case "int":
        case "int4":
            return "serial";
        case "smallint":
        case "int2":
            return "smallserial";
        case "bigint":
        case "int8":
            return "bigserial";
        default:
            return pgType;
    }
};

/**
 * Build the type string for a pulled column, handling arrays and sized types.
 */
const columnType = (col: {
    type: string;
    elementType: string | null;
    cardinality: number;
    size: number | null;
}): string => {
    // Array types
    if (col.type === "ARRAY" && col.elementType) {
        const base = col.elementType.toLowerCase();
        return base + "[]".repeat(Math.max(col.cardinality, 1));
    }

    const base = col.type.toLowerCase();

    // Sized character types
    if (col.size !== null && col.size > 0) {
        if (
            base === "character varying" ||
            base === "varchar" ||
            base === "character" ||
            base === "char" ||
            base === "bpchar"
        ) {
            const typeName =
                base === "character varying" || base === "varchar"
                    ? "varchar"
                    : "char";
            return `${typeName}(${col.size})`;
        }
    }

    return base;
};
