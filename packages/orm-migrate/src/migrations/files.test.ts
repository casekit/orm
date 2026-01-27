import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
    checksum,
    generateMigrationFilename,
    readMigrationFiles,
    writeMigrationFile,
} from "./files.js";

describe("generateMigrationFilename", () => {
    test("returns a timestamped filename with .sql extension", () => {
        const filename = generateMigrationFilename("add users table");
        expect(filename).toMatch(/^\d{14}_add_users_table\.sql$/);
    });

    test("sanitises special characters", () => {
        const filename = generateMigrationFilename("Add user's email!");
        expect(filename).toMatch(/^\d{14}_add_user_s_email\.sql$/);
    });

    test("handles empty description", () => {
        const filename = generateMigrationFilename("");
        expect(filename).toMatch(/^\d{14}_\.sql$/);
    });
});

describe("checksum", () => {
    test("returns consistent SHA-256 hash", () => {
        const hash = checksum("hello world");
        expect(hash).toBe(
            "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
        );
    });

    test("different content produces different checksums", () => {
        expect(checksum("hello")).not.toBe(checksum("world"));
    });
});

describe("readMigrationFiles and writeMigrationFile", () => {
    const testDir = join(
        "/private/tmp/claude",
        "orm-migrate-files-test-" + Date.now(),
    );

    beforeEach(() => {
        mkdirSync(testDir, { recursive: true });
    });

    afterEach(() => {
        rmSync(testDir, { recursive: true, force: true });
    });

    test("returns empty array for non-existent directory", () => {
        const files = readMigrationFiles(join(testDir, "nope"));
        expect(files).toEqual([]);
    });

    test("returns empty array for empty directory", () => {
        const files = readMigrationFiles(testDir);
        expect(files).toEqual([]);
    });

    test("reads SQL files sorted by name", () => {
        writeFileSync(
            join(testDir, "20240101000000_second.sql"),
            "SELECT 2;",
        );
        writeFileSync(
            join(testDir, "20230101000000_first.sql"),
            "SELECT 1;",
        );
        writeFileSync(join(testDir, "not_a_migration.txt"), "ignore me");

        const files = readMigrationFiles(testDir);
        expect(files).toHaveLength(2);
        expect(files[0]!.name).toBe("20230101000000_first");
        expect(files[1]!.name).toBe("20240101000000_second");
        expect(files[0]!.content).toBe("SELECT 1;");
        expect(files[1]!.content).toBe("SELECT 2;");
    });

    test("computes checksums for files", () => {
        writeFileSync(join(testDir, "20240101000000_test.sql"), "SELECT 1;");

        const files = readMigrationFiles(testDir);
        expect(files[0]!.checksum).toBe(checksum("SELECT 1;"));
    });

    test("writeMigrationFile creates directory and writes file", () => {
        const newDir = join(testDir, "nested", "migrations");
        const path = writeMigrationFile(newDir, "test.sql", "CREATE TABLE t();");

        expect(existsSync(path)).toBe(true);
        const files = readMigrationFiles(newDir);
        expect(files).toHaveLength(1);
        expect(files[0]!.content).toBe("CREATE TABLE t();");
    });
});
