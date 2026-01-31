import { describe, expect, test } from "vitest";

import type { SchemaDiffOperation } from "../diff/types.js";
import { checkSafety } from "./checkSafety.js";

describe("checkSafety", () => {
    test("returns no warnings for safe operations", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "createSchema", schema: "app" },
            { type: "createExtension", name: "uuid-ossp", schema: "app" },
            {
                type: "createTable",
                table: {
                    schema: "app",
                    name: "users",
                    columns: [
                        {
                            name: "id",
                            type: "serial",
                            nullable: false,
                            default: null,
                        },
                    ],
                    primaryKey: { name: "users_pkey", columns: ["id"] },
                    foreignKeys: [],
                    uniqueConstraints: [],
                },
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "email",
                    type: "text",
                    nullable: true,
                    default: null,
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toEqual([]);
    });

    test("flags dropTable as unsafe", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "dropTable", schema: "app", table: "users" },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("unsafe");
        expect(warnings[0]!.message).toContain("users");
    });

    test("flags dropColumn as unsafe", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "email",
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("unsafe");
        expect(warnings[0]!.message).toContain("email");
    });

    test("flags dropSchema as unsafe", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "dropSchema", schema: "old_app" },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("unsafe");
        expect(warnings[0]!.message).toContain("old_app");
    });

    test("flags unsafe type change as unsafe", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "age",
                changes: {
                    type: { from: "text", to: "integer" },
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("unsafe");
        expect(warnings[0]!.message).toContain("text");
        expect(warnings[0]!.message).toContain("integer");
    });

    test("does not flag safe type change", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "name",
                changes: {
                    type: { from: "varchar(50)", to: "varchar(255)" },
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toEqual([]);
    });

    test("flags setting NOT NULL as cautious", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "email",
                changes: {
                    nullable: { from: true, to: false },
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("cautious");
    });

    test("does not flag dropping NOT NULL", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "email",
                changes: {
                    nullable: { from: false, to: true },
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toEqual([]);
    });

    test("flags addForeignKey as cautious", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "addForeignKey",
                schema: "app",
                table: "posts",
                foreignKey: {
                    name: "fk_posts_user",
                    columns: ["user_id"],
                    referencesSchema: "app",
                    referencesTable: "users",
                    referencesColumns: ["id"],
                    onDelete: null,
                    onUpdate: null,
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("cautious");
    });

    test("flags addUniqueConstraint as cautious", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "addUniqueConstraint",
                schema: "app",
                table: "users",
                constraint: {
                    name: "users_email_key",
                    columns: ["email"],
                },
            },
        ];

        const warnings = checkSafety(ops);
        expect(warnings).toHaveLength(1);
        expect(warnings[0]!.level).toBe("cautious");
    });

    test("collects multiple warnings from multiple operations", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "dropTable", schema: "app", table: "old_table" },
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "legacy",
            },
            {
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "age",
                changes: {
                    type: { from: "text", to: "integer" },
                    nullable: { from: true, to: false },
                },
            },
        ];

        const warnings = checkSafety(ops);
        // dropTable (1) + dropColumn (1) + unsafe type change (1) + set NOT NULL (1) = 4
        expect(warnings).toHaveLength(4);
        expect(warnings.filter((w) => w.level === "unsafe")).toHaveLength(3);
        expect(warnings.filter((w) => w.level === "cautious")).toHaveLength(1);
    });
});
