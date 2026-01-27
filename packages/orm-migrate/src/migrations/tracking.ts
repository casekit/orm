import { z } from "zod";

import { Orm, sql } from "@casekit/orm";

import type { MigrationFile } from "./files.js";

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
 * Throws an error if any checksum mismatches are found.
 */
export const verifyChecksums = (
    applied: AppliedMigration[],
    files: MigrationFile[],
): string[] => {
    const fileMap = new Map(files.map((f) => [f.name, f]));
    const mismatches: string[] = [];

    for (const migration of applied) {
        const file = fileMap.get(migration.name);
        if (file && file.checksum !== migration.checksum) {
            mismatches.push(
                `Migration "${migration.name}" has been modified since it was applied (expected checksum ${migration.checksum}, got ${file.checksum})`,
            );
        }
    }

    return mismatches;
};
