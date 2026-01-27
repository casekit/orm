import { Orm, SQLStatement } from "@casekit/orm";

import { readMigrationFiles } from "./files.js";
import { acquireMigrationLock, releaseMigrationLock } from "./lock.js";
import {
    ensureMigrationTable,
    getAppliedMigrations,
    recordMigration,
    verifyChecksums,
} from "./tracking.js";

export interface RunOptions {
    migrationsPath?: string;
}

export interface RunResult {
    applied: string[];
    alreadyUpToDate: boolean;
}

const DEFAULT_MIGRATIONS_PATH = "./migrations";

/**
 * Run all pending migrations in order.
 *
 * - Acquires an advisory lock to prevent concurrent migration runs
 * - Verifies checksums of already-applied migrations
 * - Runs each pending migration in its own transaction
 *   (unless marked with -- orm:no-transaction)
 * - Records each applied migration in the tracking table
 */
export const run = async (
    db: Orm,
    options?: RunOptions,
): Promise<RunResult> => {
    const migrationsPath =
        options?.migrationsPath ?? DEFAULT_MIGRATIONS_PATH;

    await ensureMigrationTable(db);
    await acquireMigrationLock(db);

    try {
        const files = readMigrationFiles(migrationsPath);
        const applied = await getAppliedMigrations(db);

        // Verify checksums of already-applied migrations
        const mismatches = verifyChecksums(applied, files);
        if (mismatches.length > 0) {
            throw new Error(
                `Migration checksum verification failed:\n${mismatches.join("\n")}`,
            );
        }

        // Determine pending migrations
        const appliedNames = new Set(applied.map((m) => m.name));
        const pending = files.filter((f) => !appliedNames.has(f.name));

        if (pending.length === 0) {
            return { applied: [], alreadyUpToDate: true };
        }

        const appliedNames2: string[] = [];

        for (const migration of pending) {
            const isNoTransaction = migration.content
                .trimStart()
                .startsWith("-- orm:no-transaction");

            if (isNoTransaction) {
                // Execute outside a transaction (for CREATE INDEX CONCURRENTLY etc.)
                await db.query(new SQLStatement(migration.content));
                await recordMigration(db, migration.name, migration.checksum);
            } else {
                // Execute within a transaction
                await db.transact(async (db) => {
                    await db.query(new SQLStatement(migration.content));
                    await recordMigration(db, migration.name, migration.checksum);
                });
            }

            appliedNames2.push(migration.name);
        }

        return { applied: appliedNames2, alreadyUpToDate: false };
    } finally {
        await releaseMigrationLock(db);
    }
};
