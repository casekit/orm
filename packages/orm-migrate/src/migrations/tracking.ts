import { z } from "zod";

import { Orm } from "@casekit/orm";

export interface AppliedMigration {
    id: number;
    name: string;
    appliedAt: Date;
    checksum: string;
}

const AppliedMigrationSchema = z.object({
    id: z.number(),
    name: z.string(),
    appliedAt: z.date(),
    checksum: z.string(),
});

/**
 * Ensure the _orm_migrations tracking table exists.
 */
export const ensureMigrationTable = async (db: Orm): Promise<void> => {
    await db.query`
        CREATE TABLE IF NOT EXISTS public._orm_migrations (
            id serial PRIMARY KEY,
            name text NOT NULL UNIQUE,
            applied_at timestamptz NOT NULL DEFAULT now(),
            checksum text NOT NULL
        );
    `;
};

/**
 * Get all migrations that have been applied, ordered by id.
 */
export const getAppliedMigrations = async (
    db: Orm,
): Promise<AppliedMigration[]> => {
    return db.query(AppliedMigrationSchema)`
        SELECT
            id,
            name,
            applied_at AS "appliedAt",
            checksum
        FROM public._orm_migrations
        ORDER BY id
    `;
};

/**
 * Record a migration as applied.
 */
export const recordMigration = async (
    db: Orm,
    name: string,
    checksum: string,
): Promise<void> => {
    await db.query`
        INSERT INTO public._orm_migrations (name, checksum)
        VALUES (${name}, ${checksum})
    `;
};

/**
 * Verify that previously applied migrations have not been tampered with.
 * Returns an array of mismatch error messages.
 */
export const verifyChecksums = (
    applied: AppliedMigration[],
    migrations: { name: string; checksum: string }[],
): string[] => {
    const migrationMap = new Map(migrations.map((m) => [m.name, m]));
    const mismatches: string[] = [];

    for (const appliedMigration of applied) {
        const migration = migrationMap.get(appliedMigration.name);
        if (migration && migration.checksum !== appliedMigration.checksum) {
            mismatches.push(
                `Migration "${appliedMigration.name}" has been modified since it was applied (expected checksum ${appliedMigration.checksum}, got ${migration.checksum})`,
            );
        }
    }

    return mismatches;
};
