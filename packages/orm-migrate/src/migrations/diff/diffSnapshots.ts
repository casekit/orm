import type {
    ColumnSnapshot,
    ForeignKeySnapshot,
    SchemaSnapshot,
    TableSnapshot,
    UniqueConstraintSnapshot,
} from "../types.js";
import type { ColumnChanges, SchemaDiffOperation } from "./types.js";

/**
 * Diff two schema snapshots and return the operations needed
 * to transform `current` (the database) into `desired` (the config).
 *
 * Operations are returned in a safe execution order.
 */
export const diffSnapshots = (
    current: SchemaSnapshot,
    desired: SchemaSnapshot,
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];

    // 1. Schemas
    ops.push(...diffSchemas(current.schemas, desired.schemas));

    // 2. Extensions
    ops.push(...diffExtensions(current.extensions, desired.extensions));

    // Build lookup maps for tables
    const currentTables = new Map(
        current.tables.map((t) => [`${t.schema}.${t.name}`, t]),
    );
    const desiredTables = new Map(
        desired.tables.map((t) => [`${t.schema}.${t.name}`, t]),
    );

    // 3. New tables (create entire table)
    for (const [key, table] of desiredTables) {
        if (!currentTables.has(key)) {
            ops.push({ type: "createTable", table });
        }
    }

    // 4. Modified tables (diff columns, constraints)
    for (const [key, desiredTable] of desiredTables) {
        const currentTable = currentTables.get(key);
        if (currentTable) {
            ops.push(...diffTable(currentTable, desiredTable));
        }
    }

    // 5. Dropped tables
    for (const [key, table] of currentTables) {
        if (!desiredTables.has(key)) {
            ops.push({
                type: "dropTable",
                schema: table.schema,
                table: table.name,
            });
        }
    }

    // 6. Drop schemas (only schemas that no longer have any tables)
    // Schemas are dropped last
    for (const schema of current.schemas) {
        if (!desired.schemas.includes(schema)) {
            ops.push({ type: "dropSchema", schema });
        }
    }

    return reorder(ops);
};

const diffSchemas = (
    current: string[],
    desired: string[],
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];
    for (const schema of desired) {
        if (!current.includes(schema)) {
            ops.push({ type: "createSchema", schema });
        }
    }
    // Schema drops are handled at the top level after table drops
    return ops;
};

const diffExtensions = (
    current: SchemaSnapshot["extensions"],
    desired: SchemaSnapshot["extensions"],
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];
    const currentSet = new Set(current.map((e) => `${e.schema}.${e.name}`));
    const desiredSet = new Set(desired.map((e) => `${e.schema}.${e.name}`));

    for (const ext of desired) {
        if (!currentSet.has(`${ext.schema}.${ext.name}`)) {
            ops.push({
                type: "createExtension",
                name: ext.name,
                schema: ext.schema,
            });
        }
    }
    for (const ext of current) {
        if (!desiredSet.has(`${ext.schema}.${ext.name}`)) {
            ops.push({
                type: "dropExtension",
                name: ext.name,
                schema: ext.schema,
            });
        }
    }
    return ops;
};

const diffTable = (
    current: TableSnapshot,
    desired: TableSnapshot,
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];
    const { schema, name: table } = desired;

    // Columns
    ops.push(...diffColumns(schema, table, current.columns, desired.columns));

    // Primary key
    ops.push(
        ...diffPrimaryKey(
            schema,
            table,
            current.primaryKey,
            desired.primaryKey,
        ),
    );

    // Foreign keys
    ops.push(
        ...diffForeignKeys(
            schema,
            table,
            current.foreignKeys,
            desired.foreignKeys,
        ),
    );

    // Unique constraints
    ops.push(
        ...diffUniqueConstraints(
            schema,
            table,
            current.uniqueConstraints,
            desired.uniqueConstraints,
        ),
    );

    return ops;
};

const diffColumns = (
    schema: string,
    table: string,
    current: ColumnSnapshot[],
    desired: ColumnSnapshot[],
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];
    const currentMap = new Map(current.map((c) => [c.name, c]));
    const desiredMap = new Map(desired.map((c) => [c.name, c]));

    // Added columns
    for (const [name, col] of desiredMap) {
        if (!currentMap.has(name)) {
            ops.push({ type: "addColumn", schema, table, column: col });
        }
    }

    // Altered columns
    for (const [name, desiredCol] of desiredMap) {
        const currentCol = currentMap.get(name);
        if (currentCol) {
            const changes = diffColumn(currentCol, desiredCol);
            if (changes) {
                ops.push({
                    type: "alterColumn",
                    schema,
                    table,
                    column: name,
                    changes,
                });
            }
        }
    }

    // Dropped columns
    for (const [name] of currentMap) {
        if (!desiredMap.has(name)) {
            ops.push({ type: "dropColumn", schema, table, column: name });
        }
    }

    return ops;
};

const diffColumn = (
    current: ColumnSnapshot,
    desired: ColumnSnapshot,
): ColumnChanges | null => {
    const changes: ColumnChanges = {};
    let hasChanges = false;

    if (current.type !== desired.type) {
        changes.type = { from: current.type, to: desired.type };
        hasChanges = true;
    }

    if (current.nullable !== desired.nullable) {
        changes.nullable = { from: current.nullable, to: desired.nullable };
        hasChanges = true;
    }

    if (current.default !== desired.default) {
        changes.default = { from: current.default, to: desired.default };
        hasChanges = true;
    }

    return hasChanges ? changes : null;
};

const diffPrimaryKey = (
    schema: string,
    table: string,
    current: string[],
    desired: string[],
): SchemaDiffOperation[] => {
    const currentSorted = [...current].sort();
    const desiredSorted = [...desired].sort();

    if (currentSorted.join(",") === desiredSorted.join(",")) {
        return [];
    }

    // Only emit if both are non-empty (actual change) or one is empty (add/remove)
    if (desired.length === 0 && current.length === 0) {
        return [];
    }

    return [
        {
            type: "alterPrimaryKey",
            schema,
            table,
            oldColumns: current,
            newColumns: desired,
        },
    ];
};

const diffForeignKeys = (
    schema: string,
    table: string,
    current: ForeignKeySnapshot[],
    desired: ForeignKeySnapshot[],
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];
    const currentMap = new Map(current.map((fk) => [fk.name, fk]));
    const desiredMap = new Map(desired.map((fk) => [fk.name, fk]));

    // Dropped or changed FKs
    for (const [name, currentFk] of currentMap) {
        const desiredFk = desiredMap.get(name);
        if (!desiredFk || !foreignKeysEqual(currentFk, desiredFk)) {
            ops.push({
                type: "dropForeignKey",
                schema,
                table,
                constraintName: name,
            });
        }
    }

    // Added or changed FKs
    for (const [name, desiredFk] of desiredMap) {
        const currentFk = currentMap.get(name);
        if (!currentFk || !foreignKeysEqual(currentFk, desiredFk)) {
            ops.push({
                type: "addForeignKey",
                schema,
                table,
                foreignKey: desiredFk,
            });
        }
    }

    return ops;
};

const foreignKeysEqual = (
    a: ForeignKeySnapshot,
    b: ForeignKeySnapshot,
): boolean => {
    return (
        a.columns.join(",") === b.columns.join(",") &&
        a.referencesSchema === b.referencesSchema &&
        a.referencesTable === b.referencesTable &&
        a.referencesColumns.join(",") === b.referencesColumns.join(",") &&
        a.onDelete === b.onDelete &&
        a.onUpdate === b.onUpdate
    );
};

const diffUniqueConstraints = (
    schema: string,
    table: string,
    current: UniqueConstraintSnapshot[],
    desired: UniqueConstraintSnapshot[],
): SchemaDiffOperation[] => {
    const ops: SchemaDiffOperation[] = [];
    const currentMap = new Map(current.map((uc) => [uc.name, uc]));
    const desiredMap = new Map(desired.map((uc) => [uc.name, uc]));

    // Dropped or changed constraints
    for (const [name, currentUc] of currentMap) {
        const desiredUc = desiredMap.get(name);
        if (!desiredUc || !uniqueConstraintsEqual(currentUc, desiredUc)) {
            ops.push({
                type: "dropUniqueConstraint",
                schema,
                table,
                constraintName: name,
            });
        }
    }

    // Added or changed constraints
    for (const [name, desiredUc] of desiredMap) {
        const currentUc = currentMap.get(name);
        if (!currentUc || !uniqueConstraintsEqual(currentUc, desiredUc)) {
            ops.push({
                type: "addUniqueConstraint",
                schema,
                table,
                constraint: desiredUc,
            });
        }
    }

    return ops;
};

const uniqueConstraintsEqual = (
    a: UniqueConstraintSnapshot,
    b: UniqueConstraintSnapshot,
): boolean => {
    return (
        a.columns.join(",") === b.columns.join(",") &&
        (a.nullsNotDistinct ?? false) === (b.nullsNotDistinct ?? false) &&
        (a.where ?? null) === (b.where ?? null)
    );
};

/**
 * Reorder operations for safe execution:
 * 1. Create schemas
 * 2. Create extensions
 * 3. Create tables
 * 4. Add columns
 * 5. Alter columns
 * 6. Alter primary keys
 * 7. Drop foreign keys (before dropping columns they reference)
 * 8. Drop unique constraints
 * 9. Drop columns
 * 10. Add foreign keys
 * 11. Add unique constraints
 * 12. Drop tables
 * 13. Drop extensions
 * 14. Drop schemas
 */
const reorder = (ops: SchemaDiffOperation[]): SchemaDiffOperation[] => {
    const order: Record<SchemaDiffOperation["type"], number> = {
        createSchema: 0,
        createExtension: 1,
        createTable: 2,
        addColumn: 3,
        alterColumn: 4,
        alterPrimaryKey: 5,
        dropForeignKey: 6,
        dropUniqueConstraint: 7,
        dropColumn: 8,
        addForeignKey: 9,
        addUniqueConstraint: 10,
        dropTable: 11,
        dropExtension: 12,
        dropSchema: 13,
    };

    return [...ops].sort((a, b) => order[a.type] - order[b.type]);
};
