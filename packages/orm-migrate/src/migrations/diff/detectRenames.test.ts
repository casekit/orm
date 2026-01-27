import { describe, expect, test } from "vitest";

import { applyRenames, detectPotentialRenames } from "./detectRenames.js";
import type { SchemaDiffOperation } from "./types.js";

describe("detectPotentialRenames", () => {
    test("returns empty array when no drops or adds", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "createSchema", schema: "app" },
        ];
        expect(detectPotentialRenames(ops)).toEqual([]);
    });

    test("returns empty array when only drops", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old",
            },
        ];
        expect(detectPotentialRenames(ops)).toEqual([]);
    });

    test("returns empty array when only adds", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
        ];
        expect(detectPotentialRenames(ops)).toEqual([]);
    });

    test("detects potential rename when drop and add in same table", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old_name",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new_name",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
        ];

        const renames = detectPotentialRenames(ops);
        expect(renames).toHaveLength(1);
        expect(renames[0]).toEqual({
            schema: "app",
            table: "users",
            dropColumn: "old_name",
            addColumn: "new_name",
            type: "text",
            nullable: false,
            default: null,
        });
    });

    test("does not pair drop and add from different tables", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "posts",
                column: {
                    name: "new",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
        ];

        expect(detectPotentialRenames(ops)).toEqual([]);
    });

    test("pairs multiple drops and adds in same table", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old1",
            },
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old2",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new1",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new2",
                    type: "text",
                    nullable: true,
                    default: null,
                },
            },
        ];

        const renames = detectPotentialRenames(ops);
        expect(renames).toHaveLength(2);
    });

    test("does not reuse adds for multiple drops", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old1",
            },
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old2",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new1",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
        ];

        const renames = detectPotentialRenames(ops);
        // Only one rename possible since there's only one add
        expect(renames).toHaveLength(1);
    });
});

describe("applyRenames", () => {
    test("replaces drop+add with rename", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "createSchema", schema: "app" },
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "old_name",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new_name",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
        ];

        const confirmedRenames = [
            {
                schema: "app",
                table: "users",
                dropColumn: "old_name",
                addColumn: "new_name",
                type: "text",
                nullable: false,
                default: null,
            },
        ];

        const result = applyRenames(ops, confirmedRenames);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ type: "createSchema", schema: "app" });
        expect(result[1]).toEqual({
            type: "renameColumn",
            schema: "app",
            table: "users",
            oldName: "old_name",
            newName: "new_name",
        });
    });

    test("preserves unaffected operations", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "createSchema", schema: "app" },
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "keep_drop",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "keep_add",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
        ];

        // No confirmed renames
        const result = applyRenames(ops, []);

        expect(result).toEqual(ops);
    });

    test("handles partial confirmations", () => {
        const ops: SchemaDiffOperation[] = [
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "rename_me",
            },
            {
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "delete_me",
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "renamed",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            },
            {
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "new_col",
                    type: "text",
                    nullable: true,
                    default: null,
                },
            },
        ];

        // Only confirm the first rename
        const confirmedRenames = [
            {
                schema: "app",
                table: "users",
                dropColumn: "rename_me",
                addColumn: "renamed",
                type: "text",
                nullable: false,
                default: null,
            },
        ];

        const result = applyRenames(ops, confirmedRenames);

        // Should have: rename, drop, add (for the unconfirmed pair)
        expect(result).toHaveLength(3);
        expect(result.find((op) => op.type === "renameColumn")).toEqual({
            type: "renameColumn",
            schema: "app",
            table: "users",
            oldName: "rename_me",
            newName: "renamed",
        });
        expect(result.find((op) => op.type === "dropColumn")).toEqual({
            type: "dropColumn",
            schema: "app",
            table: "users",
            column: "delete_me",
        });
        expect(
            result.find(
                (op) => op.type === "addColumn" && op.column.name === "new_col",
            ),
        ).toBeDefined();
    });
});
