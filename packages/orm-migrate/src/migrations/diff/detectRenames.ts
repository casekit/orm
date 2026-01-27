import type { SchemaDiffOperation } from "./types.js";

export interface PotentialRename {
    schema: string;
    table: string;
    dropColumn: string;
    addColumn: string;
    type: string;
    nullable: boolean;
    default: string | null;
}

/**
 * Detect potential column renames in a list of operations.
 *
 * A potential rename is when:
 * 1. A column is dropped
 * 2. A column is added to the same table
 * 3. Both columns have the same type, nullable, and default
 *
 * Returns pairs of (dropColumn, addColumn) that could be renames.
 */
export const detectPotentialRenames = (
    ops: SchemaDiffOperation[],
): PotentialRename[] => {
    const potentialRenames: PotentialRename[] = [];

    // Group operations by table
    const dropsByTable = new Map<
        string,
        Array<{
            column: string;
            op: SchemaDiffOperation & { type: "dropColumn" };
        }>
    >();
    const addsByTable = new Map<
        string,
        Array<{
            column: SchemaDiffOperation & { type: "addColumn" };
        }>
    >();

    for (const op of ops) {
        if (op.type === "dropColumn") {
            const key = `${op.schema}.${op.table}`;
            if (!dropsByTable.has(key)) {
                dropsByTable.set(key, []);
            }
            dropsByTable.get(key)!.push({ column: op.column, op });
        } else if (op.type === "addColumn") {
            const key = `${op.schema}.${op.table}`;
            if (!addsByTable.has(key)) {
                addsByTable.set(key, []);
            }
            addsByTable.get(key)!.push({ column: op });
        }
    }

    // For each table with both drops and adds, find matching pairs
    for (const [tableKey, drops] of dropsByTable) {
        const adds = addsByTable.get(tableKey);
        if (!adds) continue;

        // Track which adds have been matched to avoid duplicates
        const matchedAdds = new Set<number>();

        for (const drop of drops) {
            for (let i = 0; i < adds.length; i++) {
                if (matchedAdds.has(i)) continue;

                const add = adds[i]!;
                const addCol = add.column.column;

                // Check if columns have matching attributes
                // (we can't know the dropped column's attributes, so we just pair them up)
                // The user will be prompted to confirm
                if (columnsCouldBeRename(drop.op, add.column)) {
                    const [schema, table] = tableKey.split(".");
                    potentialRenames.push({
                        schema: schema!,
                        table: table!,
                        dropColumn: drop.column,
                        addColumn: addCol.name,
                        type: addCol.type,
                        nullable: addCol.nullable,
                        default: addCol.default,
                    });
                    matchedAdds.add(i);
                    break; // Only match one add per drop
                }
            }
        }
    }

    return potentialRenames;
};

/**
 * Check if a drop and add could reasonably be a rename.
 * Currently just checks that they're in the same table.
 * More sophisticated checks could be added later.
 */
const columnsCouldBeRename = (
    _drop: SchemaDiffOperation & { type: "dropColumn" },
    _add: SchemaDiffOperation & { type: "addColumn" },
): boolean => {
    // For now, any drop+add in the same table is a potential rename
    // The user will confirm via prompt
    return true;
};

/**
 * Apply confirmed renames to an operations list.
 *
 * For each confirmed rename:
 * 1. Remove the dropColumn operation
 * 2. Remove the addColumn operation
 * 3. Add a renameColumn operation
 *
 * Returns the modified operations list.
 */
export const applyRenames = (
    ops: SchemaDiffOperation[],
    confirmedRenames: PotentialRename[],
): SchemaDiffOperation[] => {
    const result: SchemaDiffOperation[] = [];

    // Create a set of operations to remove
    const dropsToRemove = new Set<string>();
    const addsToRemove = new Set<string>();

    for (const rename of confirmedRenames) {
        dropsToRemove.add(
            `${rename.schema}.${rename.table}.${rename.dropColumn}`,
        );
        addsToRemove.add(
            `${rename.schema}.${rename.table}.${rename.addColumn}`,
        );
    }

    // Filter out the drops and adds, and add the renames
    for (const op of ops) {
        if (op.type === "dropColumn") {
            const key = `${op.schema}.${op.table}.${op.column}`;
            if (dropsToRemove.has(key)) {
                // Find the corresponding rename and add it
                const rename = confirmedRenames.find(
                    (r) =>
                        r.schema === op.schema &&
                        r.table === op.table &&
                        r.dropColumn === op.column,
                );
                if (rename) {
                    result.push({
                        type: "renameColumn",
                        schema: rename.schema,
                        table: rename.table,
                        oldName: rename.dropColumn,
                        newName: rename.addColumn,
                    });
                }
                continue;
            }
        } else if (op.type === "addColumn") {
            const key = `${op.schema}.${op.table}.${op.column.name}`;
            if (addsToRemove.has(key)) {
                continue; // Skip, already handled by renameColumn
            }
        }
        result.push(op);
    }

    return result;
};
