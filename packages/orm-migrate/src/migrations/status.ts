import { Orm } from "@casekit/orm";

import { readMigrationFiles } from "./files.js";
import {
    type AppliedMigration,
    ensureMigrationTable,
    getAppliedMigrations,
    verifyChecksums,
} from "./tracking.js";

export interface StatusOptions {
    migrationsPath?: string;
}

export interface StatusResult {
    applied: AppliedMigration[];
    pending: string[];
    checksumMismatches: string[];
}

const DEFAULT_MIGRATIONS_PATH = "./migrations";

/**
 * Get the current migration status: which migrations have been applied,
 * which are pending, and whether any checksums have changed.
 */
export const status = async (
    db: Orm,
    options?: StatusOptions,
): Promise<StatusResult> => {
    const migrationsPath =
        options?.migrationsPath ?? DEFAULT_MIGRATIONS_PATH;

    await ensureMigrationTable(db);

    const files = readMigrationFiles(migrationsPath);
    const applied = await getAppliedMigrations(db);

    const checksumMismatches = verifyChecksums(applied, files);

    const appliedNames = new Set(applied.map((m) => m.name));
    const pending = files
        .filter((f) => !appliedNames.has(f.name))
        .map((f) => f.name);

    return { applied, pending, checksumMismatches };
};
