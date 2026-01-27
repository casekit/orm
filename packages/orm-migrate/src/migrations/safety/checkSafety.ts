import type { SchemaDiffOperation } from "../diff/types.js";
import { isSafeCast } from "./safeCasts.js";
import type { SafetyWarning } from "./types.js";

/**
 * Analyse a list of schema diff operations and return warnings
 * for operations that may be unsafe or require caution.
 *
 * Inspired by the strong_migrations Ruby gem.
 */
export const checkSafety = (ops: SchemaDiffOperation[]): SafetyWarning[] => {
    const warnings: SafetyWarning[] = [];

    for (const op of ops) {
        warnings.push(...checkOperation(op));
    }

    return warnings;
};

const checkOperation = (op: SchemaDiffOperation): SafetyWarning[] => {
    switch (op.type) {
        case "dropTable":
            return [
                {
                    level: "unsafe",
                    operation: op,
                    message: `Dropping table "${op.schema}"."${op.table}" will cause permanent data loss.`,
                    suggestion:
                        "Ensure all data has been migrated before dropping. Consider renaming the table first to verify nothing depends on it.",
                },
            ];

        case "dropColumn":
            return [
                {
                    level: "unsafe",
                    operation: op,
                    message: `Dropping column "${op.column}" from "${op.schema}"."${op.table}" may cause errors if application code still references it.`,
                    suggestion:
                        "Deploy code changes that stop using this column first, then drop it in a subsequent migration.",
                },
            ];

        case "dropSchema":
            return [
                {
                    level: "unsafe",
                    operation: op,
                    message: `Dropping schema "${op.schema}" will remove all objects within it.`,
                    suggestion:
                        "Ensure all tables have been migrated out of this schema first.",
                },
            ];

        case "alterColumn":
            return checkAlterColumn(op);

        case "addForeignKey":
            return [
                {
                    level: "cautious",
                    operation: op,
                    message: `Adding foreign key "${op.foreignKey.name}" on "${op.schema}"."${op.table}" will validate all existing rows while holding a lock, blocking writes.`,
                    suggestion:
                        "For large tables, consider adding the constraint with NOT VALID first, then validating in a separate step.",
                },
            ];

        case "addUniqueConstraint":
            return [
                {
                    level: "cautious",
                    operation: op,
                    message: `Adding unique constraint "${op.constraint.name}" on "${op.schema}"."${op.table}" will block writes while the index is built.`,
                    suggestion:
                        "For large tables, consider using CREATE INDEX CONCURRENTLY in a non-transactional migration instead.",
                },
            ];

        default:
            return [];
    }
};

const checkAlterColumn = (
    op: Extract<SchemaDiffOperation, { type: "alterColumn" }>,
): SafetyWarning[] => {
    const warnings: SafetyWarning[] = [];

    // Type change
    if (op.changes.type) {
        if (!isSafeCast(op.changes.type.from, op.changes.type.to)) {
            warnings.push({
                level: "unsafe",
                operation: op,
                message: `Changing type of "${op.column}" in "${op.schema}"."${op.table}" from ${op.changes.type.from} to ${op.changes.type.to} may rewrite the entire table, blocking reads and writes.`,
                suggestion:
                    "Consider adding a new column with the desired type, migrating data, then dropping the old column.",
            });
        }
    }

    // Setting NOT NULL on an existing column
    if (op.changes.nullable && !op.changes.nullable.to) {
        warnings.push({
            level: "cautious",
            operation: op,
            message: `Setting NOT NULL on "${op.column}" in "${op.schema}"."${op.table}" will scan the entire table while holding a lock.`,
            suggestion:
                "For large tables, consider adding a CHECK constraint with NOT VALID first, validating it separately, then setting NOT NULL (PostgreSQL 12+ can leverage the validated check constraint).",
        });
    }

    return warnings;
};
