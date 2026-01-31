import { describe, expect, it } from "vitest";

import type { Column, ForeignKey, Table } from "@casekit/orm-migrate";

import { renderRelations } from "./renderRelations.js";

describe("renderRelations", () => {
    const createColumn = (column: string, nullable = false): Column => ({
        schema: "public",
        table: "test",
        column,
        ordinalPosition: 1,
        type: "integer",
        default: null,
        nullable,
        udtSchema: "pg_catalog",
        udt: "int4",
        elementType: null,
        elementTypeSchema: null,
        cardinality: 0,
        size: null,
        isSerial: false,
    });

    const createForeignKey = (overrides: Partial<ForeignKey>): ForeignKey => ({
        constraintName: "test_fk",
        schema: "public",
        tableFrom: "posts",
        tableTo: "users",
        columnsFrom: ["user_id"],
        columnsTo: ["id"],
        onUpdate: null,
        onDelete: null,
        ...overrides,
    });

    const createTable = (overrides: Partial<Table> = {}): Table => ({
        schema: "public",
        name: "posts",
        columns: [createColumn("id"), createColumn("user_id")],
        primaryKey: null,
        uniqueConstraints: [],
        foreignKeys: [],
        ...overrides,
    });

    it("renders empty string when no relations exist", () => {
        const table = createTable();
        const allForeignKeys: ForeignKey[] = [];

        expect(renderRelations(table, allForeignKeys)).toBe("");
    });

    it("renders N:1 relation for single column foreign key", () => {
        const fk = createForeignKey({});
        const table = createTable({ foreignKeys: [fk] });

        expect(renderRelations(table, [])).toBe(
            'user: { type: "N:1", model: "users", fromField: "userId", toField: "id" }',
        );
    });

    it("renders N:1 relation with non-id target field", () => {
        const fk = createForeignKey({
            columnsFrom: ["email"],
            columnsTo: ["email"],
        });
        const table = createTable({
            columns: [createColumn("id"), createColumn("email")],
            foreignKeys: [fk],
        });

        expect(renderRelations(table, [])).toBe(
            'email: { type: "N:1", model: "users", fromField: "email", toField: "email" }',
        );
    });

    it("renders N:1 relation with optional flag for nullable columns", () => {
        const fk = createForeignKey({});
        const table = createTable({
            columns: [createColumn("id"), createColumn("user_id", true)],
            foreignKeys: [fk],
        });

        expect(renderRelations(table, [])).toBe(
            'user: { type: "N:1", model: "users", fromField: "userId", toField: "id", optional: true }',
        );
    });

    it("renders N:1 relation for multi-column foreign key", () => {
        const fk = createForeignKey({
            columnsFrom: ["tenant_id", "user_id"],
            columnsTo: ["tenant_id", "id"],
        });
        const table = createTable({
            columns: [
                createColumn("id"),
                createColumn("tenant_id"),
                createColumn("user_id"),
            ],
            foreignKeys: [fk],
        });

        expect(renderRelations(table, [])).toBe(
            'tenantUser: { type: "N:1", model: "users", fromField: ["tenantId", "userId"], toField: ["tenantId", "id"] }',
        );
    });

    it("renders 1:N relation for incoming foreign key", () => {
        const table = createTable({ name: "users", foreignKeys: [] });
        const allForeignKeys = [createForeignKey({})];

        expect(renderRelations(table, allForeignKeys)).toBe(
            'posts: { type: "1:N", model: "posts", fromField: "id", toField: "userId" }',
        );
    });

    it("renders 1:N relation with non-id source field", () => {
        const table = createTable({
            name: "users",
            columns: [createColumn("id"), createColumn("email")],
            foreignKeys: [],
        });
        const allForeignKeys = [
            createForeignKey({
                tableTo: "users",
                columnsFrom: ["author_email"],
                columnsTo: ["email"],
            }),
        ];

        expect(renderRelations(table, allForeignKeys)).toBe(
            'authorEmailPosts: { type: "1:N", model: "posts", fromField: "email", toField: "authorEmail" }',
        );
    });

    it("renders 1:N relation for multi-column foreign key", () => {
        const table = createTable({
            name: "users",
            columns: [createColumn("tenant_id"), createColumn("id")],
            foreignKeys: [],
        });
        const allForeignKeys = [
            createForeignKey({
                tableTo: "users",
                columnsFrom: ["tenant_id", "user_id"],
                columnsTo: ["tenant_id", "id"],
            }),
        ];

        expect(renderRelations(table, allForeignKeys)).toBe(
            'tenantUserPosts: { type: "1:N", model: "posts", fromField: ["tenantId", "id"], toField: ["tenantId", "userId"] }',
        );
    });

    it("renders both N:1 and 1:N relations", () => {
        const outgoingFk = createForeignKey({
            tableFrom: "posts",
            tableTo: "users",
        });
        const incomingFk = createForeignKey({
            tableFrom: "comments",
            tableTo: "posts",
            columnsFrom: ["post_id"],
        });

        const table = createTable({
            foreignKeys: [outgoingFk],
        });
        const allForeignKeys = [outgoingFk, incomingFk];

        const result = renderRelations(table, allForeignKeys);

        expect(result).toBe(
            'user: { type: "N:1", model: "users", fromField: "userId", toField: "id" },\n' +
                '        comments: { type: "1:N", model: "comments", fromField: "id", toField: "postId" }',
        );
    });

    it("filters 1:N relations by schema", () => {
        const table = createTable({
            schema: "public",
            name: "users",
            foreignKeys: [],
        });
        const allForeignKeys = [
            createForeignKey({ schema: "public", tableTo: "users" }),
            createForeignKey({ schema: "other", tableTo: "users" }),
        ];

        const result = renderRelations(table, allForeignKeys);

        // Should only include the foreign key from the same schema
        expect(result).toBe(
            'posts: { type: "1:N", model: "posts", fromField: "id", toField: "userId" }',
        );
    });

    it("handles self-referential relations", () => {
        const fk = createForeignKey({
            tableFrom: "categories",
            tableTo: "categories",
            columnsFrom: ["parent_id"],
        });
        const table = createTable({
            name: "categories",
            columns: [createColumn("id"), createColumn("parent_id", true)],
            foreignKeys: [fk],
        });
        const allForeignKeys = [fk];

        const result = renderRelations(table, allForeignKeys);

        expect(result).toBe(
            'parent: { type: "N:1", model: "categories", fromField: "parentId", toField: "id", optional: true },\n' +
                '        parentCategories: { type: "1:N", model: "categories", fromField: "id", toField: "parentId" }',
        );
    });
});
