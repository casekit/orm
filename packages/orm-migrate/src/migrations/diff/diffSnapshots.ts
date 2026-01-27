import type {
    ColumnSnapshot,
    ForeignKeySnapshot,
    PrimaryKeySnapshot,
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

    return ops;
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

    const currentColMap = new Map(current.columns.map((c) => [c.name, c]));
    const desiredColMap = new Map(desired.columns.map((c) => [c.name, c]));

    const currentFkMap = new Map(
        current.foreignKeys.map((fk) => [fk.name, fk]),
    );
    const desiredFkMap = new Map(
        desired.foreignKeys.map((fk) => [fk.name, fk]),
    );

    const currentUcMap = new Map(
        current.uniqueConstraints.map((uc) => [uc.name, uc]),
    );
    const desiredUcMap = new Map(
        desired.uniqueConstraints.map((uc) => [uc.name, uc]),
    );

    // 1. Add columns
    for (const [name, col] of desiredColMap) {
        if (!currentColMap.has(name)) {
            ops.push({ type: "addColumn", schema, table, column: col });
        }
    }

    // 2. Alter columns
    for (const [name, desiredCol] of desiredColMap) {
        const currentCol = currentColMap.get(name);
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

    // 3. Alter primary key
    ops.push(
        ...diffPrimaryKey(
            schema,
            table,
            current.primaryKey,
            desired.primaryKey,
        ),
    );

    // 4. Drop foreign keys (before dropping columns they may reference)
    for (const [name, currentFk] of currentFkMap) {
        const desiredFk = desiredFkMap.get(name);
        if (!desiredFk || !foreignKeysEqual(currentFk, desiredFk)) {
            ops.push({
                type: "dropForeignKey",
                schema,
                table,
                constraintName: name,
            });
        }
    }

    // 5. Drop unique constraints (before dropping columns they may reference)
    for (const [name, currentUc] of currentUcMap) {
        const desiredUc = desiredUcMap.get(name);
        if (!desiredUc || !uniqueConstraintsEqual(currentUc, desiredUc)) {
            ops.push({
                type: "dropUniqueConstraint",
                schema,
                table,
                constraintName: name,
            });
        }
    }

    // 6. Drop columns
    for (const [name] of currentColMap) {
        if (!desiredColMap.has(name)) {
            ops.push({ type: "dropColumn", schema, table, column: name });
        }
    }

    // 7. Add foreign keys
    for (const [name, desiredFk] of desiredFkMap) {
        const currentFk = currentFkMap.get(name);
        if (!currentFk || !foreignKeysEqual(currentFk, desiredFk)) {
            ops.push({
                type: "addForeignKey",
                schema,
                table,
                foreignKey: desiredFk,
            });
        }
    }

    // 8. Add unique constraints
    for (const [name, desiredUc] of desiredUcMap) {
        const currentUc = currentUcMap.get(name);
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
    current: PrimaryKeySnapshot,
    desired: PrimaryKeySnapshot,
): SchemaDiffOperation[] => {
    // Compare columns in order - PK column order is semantically significant
    if (current.columns.join(",") === desired.columns.join(",")) {
        return [];
    }

    // Only emit if both are non-empty (actual change) or one is empty (add/remove)
    if (desired.columns.length === 0 && current.columns.length === 0) {
        return [];
    }

    return [
        {
            type: "alterPrimaryKey",
            schema,
            table,
            oldConstraintName: current.name,
            oldColumns: current.columns,
            newColumns: desired.columns,
        },
    ];
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
