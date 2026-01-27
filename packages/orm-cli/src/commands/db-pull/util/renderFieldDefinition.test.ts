import { describe, expect, it } from "vitest";

import type { Column, Table } from "@casekit/orm-migrate";

import { renderFieldDefinition } from "./renderFieldDefinition.js";

describe("renderFieldDefinition", () => {
    const createColumn = (overrides: Partial<Column>): Column => ({
        schema: "public",
        table: "test",
        column: "test_column",
        ordinalPosition: 1,
        type: "text",
        default: null,
        nullable: false,
        udtSchema: "pg_catalog",
        udt: "text",
        elementType: null,
        elementTypeSchema: null,
        cardinality: 0,
        size: null,
        isSerial: false,
        ...overrides,
    });

    const createTable = (overrides: Partial<Table> = {}): Table => ({
        schema: "public",
        name: "test",
        columns: [],
        primaryKey: null,
        uniqueConstraints: [],
        foreignKeys: [],
        ...overrides,
    });

    it("renders basic field definition", () => {
        const column = createColumn({ column: "name", type: "text" });
        const table = createTable();

        expect(renderFieldDefinition(column, table)).toBe('{ type: "text" }');
    });

    it("handles nullable fields", () => {
        const column = createColumn({
            column: "email",
            type: "text",
            nullable: true,
        });
        const table = createTable();

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "text", nullable: true }',
        );
    });

    it("handles default values", () => {
        const column = createColumn({
            column: "status",
            type: "text",
            default: "'active'::text",
        });
        const table = createTable();

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "text", default: "active" }',
        );
    });

    it("marks single-column primary keys", () => {
        const column = createColumn({ column: "id", type: "integer" });
        const table = createTable({
            primaryKey: {
                schema: "public",
                table: "test",
                constraintName: "test_pkey",
                columns: ["id"],
            },
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "integer", primaryKey: true }',
        );
    });

    it("doesn't mark primary key for multi-column primary keys", () => {
        const column = createColumn({ column: "id", type: "integer" });
        const table = createTable({
            primaryKey: {
                schema: "public",
                table: "test",
                constraintName: "test_pkey",
                columns: ["id", "tenant_id"],
            },
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "integer" }',
        );
    });

    it("marks single-column unique constraints", () => {
        const column = createColumn({ column: "email", type: "text" });
        const table = createTable({
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "test",
                    name: "test_email_key",
                    definition: "UNIQUE (email)",
                    columns: ["email"],
                    nullsNotDistinct: false,
                },
            ],
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "text", unique: true }',
        );
    });

    it("handles unique constraints with NULLS NOT DISTINCT", () => {
        const column = createColumn({ column: "email", type: "text" });
        const table = createTable({
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "test",
                    name: "test_email_key",
                    definition: "UNIQUE NULLS NOT DISTINCT (email)",
                    columns: ["email"],
                    nullsNotDistinct: false,
                },
            ],
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "text", unique: { nullsNotDistinct: true } }',
        );
    });

    it("handles single-column foreign key references", () => {
        const column = createColumn({ column: "user_id", type: "integer" });
        const table = createTable({
            foreignKeys: [
                {
                    constraintName: "test_user_id_fkey",
                    schema: "public",
                    tableFrom: "test",
                    tableTo: "users",
                    columnsFrom: ["user_id"],
                    columnsTo: ["id"],
                    onUpdate: null,
                    onDelete: null,
                },
            ],
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ column: "user_id", type: "integer", references: { model: "users", field: "id" } }',
        );
    });

    it("handles foreign key references to non-id fields", () => {
        const column = createColumn({ column: "email", type: "text" });
        const table = createTable({
            foreignKeys: [
                {
                    constraintName: "test_email_fkey",
                    schema: "public",
                    tableFrom: "test",
                    tableTo: "users",
                    columnsFrom: ["email"],
                    columnsTo: ["email"],
                    onUpdate: null,
                    onDelete: null,
                },
            ],
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "text", references: { model: "users", field: "email" } }',
        );
    });

    it("doesn't add references for multi-column foreign keys", () => {
        const column = createColumn({ column: "user_id", type: "integer" });
        const table = createTable({
            foreignKeys: [
                {
                    constraintName: "test_user_tenant_fkey",
                    schema: "public",
                    tableFrom: "test",
                    tableTo: "users",
                    columnsFrom: ["user_id", "tenant_id"],
                    columnsTo: ["id", "tenant_id"],
                    onUpdate: null,
                    onDelete: null,
                },
            ],
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ column: "user_id", type: "integer" }',
        );
    });

    it("handles complex field with multiple attributes", () => {
        const column = createColumn({
            column: "email",
            type: "varchar",
            nullable: true,
            default: "'default@example.com'::text",
        });
        const table = createTable({
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "test",
                    name: "test_email_key",
                    definition: 'UNIQUE ("email")',
                    columns: ["email"],
                    nullsNotDistinct: false,
                },
            ],
        });

        expect(renderFieldDefinition(column, table)).toBe(
            '{ type: "varchar", unique: true, nullable: true, default: "default@example.com" }',
        );
    });

    it("handles array types correctly", () => {
        const column = createColumn({
            column: "tags",
            type: "ARRAY",
            elementType: "text",
            cardinality: 1,
        });
        const table = createTable();

        expect(renderFieldDefinition(column, table)).toBe('{ type: "text[]" }');
    });
});
