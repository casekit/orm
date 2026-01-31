import { migrate } from "@casekit/orm-migrate";

import { Handler } from "#types.js";
import { loadConfig } from "#util/loadConfig.js";
import { readMigrationFiles } from "#util/migrations.js";
import { builder } from "./options.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const config = await loadConfig(opts);
    const { db } = config;

    const migrationsPath = config.migrate?.migrationsPath ?? "./migrations";

    try {
        const migrations = readMigrationFiles(migrationsPath);
        const result = await migrate.run(db, migrations);

        if (result.alreadyUpToDate) {
            console.log("Already up to date.");
        } else {
            console.log(`Applied ${result.applied.length} migration(s):`);
            for (const name of result.applied) {
                console.log(`  - ${name}`);
            }
            console.log("✅ Done");
        }
    } catch (e) {
        console.error("Error running migrations", e);
        process.exitCode = 1;
        throw e;
    }
};
