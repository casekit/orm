import { Orm, SQLStatement } from "@casekit/orm";

import { acquireMigrationLock, releaseMigrationLock } from "./lock.js";
import {
    ensureMigrationTable,
    getAppliedMigrations,
    recordMigration,
    verifyChecksums,
} from "./tracking.js";

export interface Migration {
    name: string;
    sql: string;
    checksum: string;
}

export interface RunResult {
    applied: string[];
    alreadyUpToDate: boolean;
}

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
    migrations: Migration[],
): Promise<RunResult> => {
    await ensureMigrationTable(db);

    try {
        await acquireMigrationLock(db);
        const applied = await getAppliedMigrations(db);

        // Verify checksums of already-applied migrations
        const mismatches = verifyChecksums(applied, migrations);
        if (mismatches.length > 0) {
            throw new Error(
                `Migration checksum verification failed:\n${mismatches.join("\n")}`,
            );
        }

        // Determine pending migrations
        const appliedNames = new Set(applied.map((m) => m.name));
        const pending = migrations.filter((m) => !appliedNames.has(m.name));

        if (pending.length === 0) {
            return { applied: [], alreadyUpToDate: true };
        }

        const appliedMigrationNames: string[] = [];

        for (const migration of pending) {
            const isNoTransaction = migration.sql
                .trimStart()
                .startsWith("-- orm:no-transaction");

            if (isNoTransaction) {
                // Execute outside a transaction (for CREATE INDEX CONCURRENTLY etc.)
                await db.query(new SQLStatement(migration.sql));
                await recordMigration(db, migration.name, migration.checksum);
            } else {
                // Execute within a transaction
                await db.transact(async (db) => {
                    await db.query(new SQLStatement(migration.sql));
                    await recordMigration(
                        db,
                        migration.name,
                        migration.checksum,
                    );
                });
            }

            appliedMigrationNames.push(migration.name);
        }

        return { applied: appliedMigrationNames, alreadyUpToDate: false };
    } finally {
        await releaseMigrationLock(db);
    }
};
