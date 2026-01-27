import { migrate } from "@casekit/orm-migrate";

import { Handler } from "#types.js";
import { loadConfig } from "#util/loadConfig.js";
import { builder } from "./options.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const config = await loadConfig(opts);
    const { db } = config;

    const migrationsPath = config.migrate?.migrationsPath ?? "./migrations";

    try {
        const result = await migrate.status(db, { migrationsPath });

        if (result.checksumMismatches.length > 0) {
            console.log("\n🚨 Checksum mismatches:");
            for (const mismatch of result.checksumMismatches) {
                console.log(`  - ${mismatch}`);
            }
        }

        if (result.applied.length > 0) {
            console.log("\nApplied migrations:");
            for (const m of result.applied) {
                console.log(
                    `  ✅ ${m.name} (applied ${m.appliedAt.toISOString()})`,
                );
            }
        }

        if (result.pending.length > 0) {
            console.log("\nPending migrations:");
            for (const name of result.pending) {
                console.log(`  ⏳ ${name}`);
            }
        }

        if (
            result.applied.length === 0 &&
            result.pending.length === 0
        ) {
            console.log("No migrations found.");
        }
    } catch (e) {
        console.error("Error getting migration status", e);
        process.exitCode = 1;
        throw e;
    }
};
