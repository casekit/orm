import { Orm } from "@casekit/orm";

/**
 * Advisory lock key derived from CRC32("casekit-orm-migrate").
 * PostgreSQL advisory locks require integer keys, so we use a
 * deterministic hash of a meaningful string to avoid collisions.
 */
const MIGRATION_LOCK_KEY = 3315941887;

/**
 * Acquire a session-level advisory lock for migrations.
 * Blocks until the lock is available, ensuring only one migrator
 * can run at a time.
 *
 * Session-level locks (not transaction-level) are used because some
 * migrations may need to run outside transactions
 * (e.g. CREATE INDEX CONCURRENTLY).
 */
export const acquireMigrationLock = async (db: Orm): Promise<void> => {
    await db.query`SELECT pg_advisory_lock(${MIGRATION_LOCK_KEY})`;
};

/**
 * Release the session-level advisory lock for migrations.
 * Should always be called in a finally block after acquireMigrationLock.
 */
export const releaseMigrationLock = async (db: Orm): Promise<void> => {
    await db.query`SELECT pg_advisory_unlock(${MIGRATION_LOCK_KEY})`;
};
