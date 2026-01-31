import { createHash } from "crypto";
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    writeFileSync,
} from "fs";
import { join } from "path";

export interface MigrationFile {
    name: string;
    path: string;
    sql: string;
    checksum: string;
}

/**
 * Generate a timestamped migration filename.
 * Format: YYYYMMDDHHMMSS-description.sql
 */
export const generateMigrationFilename = (description: string): string => {
    // toISOString() returns UTC in ISO 8601 format which sorts alphabetically
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14);

    const slug = description
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    return `${timestamp}-${slug}.sql`;
};

/**
 * Compute a SHA-256 checksum of content.
 */
export const checksum = (content: string): string => {
    return createHash("sha256").update(content).digest("hex");
};

/**
 * Read all migration SQL files from a directory, sorted by filename.
 */
export const readMigrationFiles = (migrationsPath: string): MigrationFile[] => {
    if (!existsSync(migrationsPath)) {
        return [];
    }

    const files = readdirSync(migrationsPath)
        .filter((f) => f.endsWith(".sql"))
        .sort();

    return files.map((file) => {
        const filePath = join(migrationsPath, file);
        const content = readFileSync(filePath, "utf-8");
        return {
            name: file.replace(/\.sql$/, ""),
            path: filePath,
            sql: content,
            checksum: checksum(content),
        };
    });
};

/**
 * Write a migration file to the migrations directory.
 * Creates the directory if it doesn't exist.
 * Returns the full path of the written file.
 */
export const writeMigrationFile = (
    migrationsPath: string,
    filename: string,
    content: string,
): string => {
    mkdirSync(migrationsPath, { recursive: true });
    const filePath = join(migrationsPath, filename);
    writeFileSync(filePath, content, "utf-8");
    return filePath;
};
