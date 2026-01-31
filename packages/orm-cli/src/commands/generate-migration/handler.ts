import { confirm } from "@inquirer/prompts";
import { unlinkSync } from "fs";

import {
    type PotentialRename,
    applyRenames,
    detectPotentialRenames,
    migrate,
    operationsToSql,
} from "@casekit/orm-migrate";

import { Handler } from "#types.js";
import { loadConfig } from "#util/loadConfig.js";
import {
    generateMigrationFilename,
    writeMigrationFile,
} from "#util/migrations.js";
import { builder } from "./options.js";

/**
 * Prompt the user to confirm each potential column rename.
 * Returns the list of confirmed renames.
 */
const promptForRenames = async (
    potentialRenames: PotentialRename[],
): Promise<PotentialRename[]> => {
    const confirmed: PotentialRename[] = [];

    for (const rename of potentialRenames) {
        const isRename = await confirm({
            message: `Column "${rename.dropColumn}" is being dropped and "${rename.addColumn}" is being added in "${rename.schema}"."${rename.table}". Is this a rename?`,
            default: true,
        });

        if (isRename) {
            confirmed.push(rename);
        }
    }

    return confirmed;
};

export const handler: Handler<typeof builder> = async (opts) => {
    const config = await loadConfig(opts);
    const { db } = config;

    const migrationsPath = config.migrate?.migrationsPath ?? "./migrations";

    try {
        const result = await migrate.generate(db);

        if (!result) {
            console.log("No changes detected.");
            return;
        }

        // Detect potential column renames and prompt the user
        let operations = result.operations;
        let sql = result.sql;

        const potentialRenames = detectPotentialRenames(operations);
        if (potentialRenames.length > 0) {
            const confirmedRenames = await promptForRenames(potentialRenames);
            if (confirmedRenames.length > 0) {
                operations = applyRenames(operations, confirmedRenames);
                sql = operationsToSql(operations).join("\n\n") + "\n";
            }
        }

        // Write the migration file
        const filename = generateMigrationFilename(opts.name);
        const filePath = writeMigrationFile(migrationsPath, filename, sql);

        console.log(`\nGenerated migration: ${filePath}\n`);
        console.log(sql);

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
                        unlinkSync(filePath);
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
