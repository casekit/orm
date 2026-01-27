import { Orm } from "@casekit/orm";

import { pull } from "#pull.js";
import { getExtensions } from "#pull/getExtensions.js";
import { configToSnapshot } from "./configToSnapshot.js";
import { diffSnapshots } from "./diff/diffSnapshots.js";
import { operationsToSql } from "./diff/operationToSql.js";
import type { SchemaDiffOperation } from "./diff/types.js";
import { pulledToSnapshot } from "./pulledToSnapshot.js";
import { checkSafety } from "./safety/checkSafety.js";
import type { SafetyWarning } from "./safety/types.js";

export interface GenerateResult {
    operations: SchemaDiffOperation[];
    warnings: SafetyWarning[];
    sql: string;
}

/**
 * Generate migration SQL by diffing the TypeScript config
 * against the current database state.
 *
 * Returns null if there are no differences.
 */
export const generate = async (db: Orm): Promise<GenerateResult | null> => {
    // 1. Get the desired state from the TypeScript config
    const desiredSnapshot = configToSnapshot(db.config);

    // 2. Get the current state from the database
    const schemas = [
        ...new Set(Object.values(db.config.models).map((m) => m.schema)),
    ];
    const [tables, extensions] = await Promise.all([
        pull(db, schemas),
        db.query(getExtensions(schemas)),
    ]);
    const currentSnapshot = pulledToSnapshot(tables, extensions);

    // 3. Diff
    const operations = diffSnapshots(currentSnapshot, desiredSnapshot);

    if (operations.length === 0) {
        return null;
    }

    // 4. Safety checks
    const warnings = checkSafety(operations);

    // 5. Generate SQL
    const sqlStatements = operationsToSql(operations);
    const sql = sqlStatements.join("\n\n") + "\n";

    return {
        operations,
        warnings,
        sql,
    };
};
