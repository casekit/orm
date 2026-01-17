import { describe, expect, it } from "vitest";

import type { Table } from "@casekit/orm-migrate";
import { unindent } from "@casekit/unindent";

import { renderModel } from "./renderModel.js";

describe("renderModel - basic functionality", () => {
    it("renders a simple table with basic fields", async () => {
        const table: Table = {
            schema: "public",
            name: "users",
            columns: [
                {
                    schema: "public",
                    table: "users",
                    column: "id",
                    ordinalPosition: 1,
                    type: "integer",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "int4",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "users",
                    column: "name",
                    ordinalPosition: 2,
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
                },
                {
                    schema: "public",
                    table: "users",
                    column: "email",
                    ordinalPosition: 3,
                    type: "text",
                    default: null,
                    nullable: true,
                    udtSchema: "pg_catalog",
                    udt: "text",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                    name: { type: "text" },
                    email: { type: "text", nullable: true },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("renders a table with schema and table name different from model name", async () => {
        const table: Table = {
            schema: "my_schema",
            name: "user_accounts",
            columns: [
                {
                    schema: "my_schema",
                    table: "user_accounts",
                    column: "id",
                    ordinalPosition: 1,
                    type: "integer",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "int4",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const userAccounts = {
                schema: "my_schema",
                table: "user_accounts",
                fields: {
                    id: { type: "integer" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("preserves column names when different from field names", async () => {
        const table: Table = {
            schema: "public",
            name: "users",
            columns: [
                {
                    schema: "public",
                    table: "users",
                    column: "first_name",
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
                },
                {
                    schema: "public",
                    table: "users",
                    column: "created_at",
                    ordinalPosition: 2,
                    type: "timestamp",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "timestamp",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    firstName: { column: "first_name", type: "text" },
                    createdAt: { column: "created_at", type: "timestamp" },
                },
            } as const satisfies ModelDefinition;
        `);
    });
});
