import { Orm } from "@casekit/orm";

import { pull } from "#pull.js";

import { configToSnapshot } from "./configToSnapshot.js";
import { diffSnapshots } from "./diff/diffSnapshots.js";
import { operationsToSql } from "./diff/operationToSql.js";
import type { SchemaDiffOperation } from "./diff/types.js";
import {
    generateMigrationFilename,
    writeMigrationFile,
} from "./files.js";
import { pulledToSnapshot } from "./pulledToSnapshot.js";
import { checkSafety } from "./safety/checkSafety.js";
import type { SafetyWarning } from "./safety/types.js";

export interface GenerateOptions {
    migrationsPath?: string;
    description?: string;
}

export interface GenerateResult {
    filePath: string;
    operations: SchemaDiffOperation[];
    warnings: SafetyWarning[];
    sql: string;
}

const DEFAULT_MIGRATIONS_PATH = "./migrations";

/**
 * Generate a migration file by diffing the TypeScript config
 * against the current database state.
 *
 * Returns null if there are no differences.
 */
export const generate = async (
    db: Orm,
    options?: GenerateOptions,
): Promise<GenerateResult | null> => {
    const migrationsPath =
        options?.migrationsPath ?? DEFAULT_MIGRATIONS_PATH;
    const description = options?.description ?? "migration";

    // 1. Get the desired state from the TypeScript config
    const desiredSnapshot = configToSnapshot(db.config);

    // 2. Get the current state from the database
    const schemas = [
        ...new Set(Object.values(db.config.models).map((m) => m.schema)),
    ];
    const tables = await pull(db, schemas);
    const currentSnapshot = pulledToSnapshot(tables);

    // 3. Diff
    const operations = diffSnapshots(currentSnapshot, desiredSnapshot);

    if (operations.length === 0) {
        return null;
    }

    // 4. Safety checks
    const warnings = checkSafety(operations);

    // 5. Generate SQL
    const sqlStatements = operationsToSql(operations);
    const sqlContent = sqlStatements.join("\n\n") + "\n";

    // 6. Write migration file
    const filename = generateMigrationFilename(description);
    const filePath = writeMigrationFile(migrationsPath, filename, sqlContent);

    return {
        filePath,
        operations,
        warnings,
        sql: sqlContent,
    };
};
