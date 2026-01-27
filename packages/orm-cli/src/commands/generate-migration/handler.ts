import { confirm } from "@inquirer/prompts";

import { migrate } from "@casekit/orm-migrate";

import { Handler } from "#types.js";
import { loadConfig } from "#util/loadConfig.js";
import { builder } from "./options.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const config = await loadConfig(opts);
    const { db } = config;

    const migrationsPath = config.migrate?.migrationsPath ?? "./migrations";

    try {
        const result = await migrate.generate(db, {
            migrationsPath,
            description: opts.name,
        });

        if (!result) {
            console.log("No changes detected.");
            return;
        }

        console.log(`\nGenerated migration: ${result.filePath}\n`);
        console.log(result.sql);

        if (result.warnings.length > 0) {
            const unsafeWarnings = result.warnings.filter(
                (w) => w.level === "unsafe",
            );
            const cautiousWarnings = result.warnings.filter(
                (w) => w.level === "cautious",
            );

            if (cautiousWarnings.length > 0) {
                console.log("\n⚠️  Cautious operations:");
                for (const w of cautiousWarnings) {
                    console.log(`  - ${w.message}`);
                    if (w.suggestion) {
                        console.log(`    Suggestion: ${w.suggestion}`);
                    }
                }
            }

            if (unsafeWarnings.length > 0) {
                console.log("\n🚨 Unsafe operations:");
                for (const w of unsafeWarnings) {
                    console.log(`  - ${w.message}`);
                    if (w.suggestion) {
                        console.log(`    Suggestion: ${w.suggestion}`);
                    }
                }

                if (!opts.force && !opts.unsafe) {
                    const proceed = await confirm({
                        message:
                            "This migration contains unsafe operations. Do you want to keep it?",
                        default: false,
                    });

                    if (!proceed) {
                        const { unlinkSync } = await import("fs");
                        unlinkSync(result.filePath);
                        console.log("Migration file removed.");
                        return;
                    }
                }
            }
        }

        console.log("✅ Done");
    } catch (e) {
        console.error("Error generating migration", e);
        process.exitCode = 1;
        throw e;
    }
};
