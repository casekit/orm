import { describe, expect, it } from "vitest";

import type { Table } from "@casekit/orm-migrate";
import { unindent } from "@casekit/unindent";

import { renderModel } from "./renderModel.js";

describe("renderModel - constraints", () => {
    it("handles single column primary key", async () => {
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
            ],
            foreignKeys: [],
            primaryKey: {
                schema: "public",
                table: "users",
                constraintName: "users_pkey",
                columns: ["id"],
            },
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer", primaryKey: true },
                    name: { type: "text" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles composite primary key", async () => {
        const table: Table = {
            schema: "public",
            name: "user_roles",
            columns: [
                {
                    schema: "public",
                    table: "user_roles",
                    column: "user_id",
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
                    table: "user_roles",
                    column: "role_id",
                    ordinalPosition: 2,
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
                    table: "user_roles",
                    column: "granted_at",
                    ordinalPosition: 3,
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
            primaryKey: {
                schema: "public",
                table: "user_roles",
                constraintName: "user_roles_pkey",
                columns: ["user_id", "role_id"],
            },
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const userRoles = {
                table: "user_roles",
                fields: {
                    userId: { column: "user_id", type: "integer" },
                    roleId: { column: "role_id", type: "integer" },
                    grantedAt: { column: "granted_at", type: "timestamp" },
                },
                primaryKey: ["userId", "roleId"],
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles single column unique constraint", async () => {
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
                    column: "email",
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
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "users",
                    name: "users_email_key",
                    definition:
                        "CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)",
                },
            ],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                    email: { type: "text", unique: true },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles unique constraint with nulls not distinct", async () => {
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
                    column: "email",
                    ordinalPosition: 2,
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
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "users",
                    name: "users_email_key",
                    definition:
                        "CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email) NULLS NOT DISTINCT",
                },
            ],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                    email: {
                        type: "text",
                        unique: { nullsNotDistinct: true },
                        nullable: true,
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles multi-column unique constraints", async () => {
        const table: Table = {
            schema: "public",
            name: "products",
            columns: [
                {
                    schema: "public",
                    table: "products",
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
                    table: "products",
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
                    table: "products",
                    column: "category",
                    ordinalPosition: 3,
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
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "products",
                    name: "products_name_category_key",
                    definition:
                        "CREATE UNIQUE INDEX products_name_category_key ON public.products USING btree (name, category)",
                },
            ],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const products = {
                fields: {
                    id: { type: "integer" },
                    name: { type: "text" },
                    category: { type: "text" },
                },
                uniqueConstraints: [{ fields: ["name", "category"] }],
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles multi-column unique constraints with nulls not distinct", async () => {
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
                    column: "email",
                    ordinalPosition: 2,
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
                {
                    schema: "public",
                    table: "users",
                    column: "deleted_at",
                    ordinalPosition: 3,
                    type: "timestamp",
                    default: null,
                    nullable: true,
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
            uniqueConstraints: [
                {
                    schema: "public",
                    table: "users",
                    name: "users_email_deleted_at_key",
                    definition:
                        "CREATE UNIQUE INDEX users_email_deleted_at_key ON public.users USING btree (email, deleted_at) NULLS NOT DISTINCT",
                },
            ],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                    email: { type: "text", nullable: true },
                    deletedAt: { column: "deleted_at", type: "timestamp", nullable: true },
                },
                uniqueConstraints: [
                    { fields: ["email", "deletedAt"], nullsNotDistinct: true },
                ],
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles single column foreign key", async () => {
        const table: Table = {
            schema: "public",
            name: "posts",
            columns: [
                {
                    schema: "public",
                    table: "posts",
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
                    table: "posts",
                    column: "author_id",
                    ordinalPosition: 2,
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
            foreignKeys: [
                {
                    schema: "public",
                    constraintName: "posts_author_id_fkey",
                    tableFrom: "posts",
                    columnsFrom: ["author_id"],
                    tableTo: "users",
                    columnsTo: ["id"],
                },
            ],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const posts = {
                fields: {
                    id: { type: "integer" },
                    authorId: {
                        column: "author_id",
                        type: "integer",
                        references: { model: "users", field: "id" },
                    },
                },
                relations: {
                    author: {
                        type: "N:1",
                        model: "users",
                        fromField: "authorId",
                        toField: "id",
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles foreign key with non-id reference", async () => {
        const table: Table = {
            schema: "public",
            name: "posts",
            columns: [
                {
                    schema: "public",
                    table: "posts",
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
                    table: "posts",
                    column: "color_hex",
                    ordinalPosition: 2,
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
            foreignKeys: [
                {
                    schema: "public",
                    constraintName: "posts_color_hex_fkey",
                    tableFrom: "posts",
                    columnsFrom: ["color_hex"],
                    tableTo: "colors",
                    columnsTo: ["hex"],
                },
            ],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const posts = {
                fields: {
                    id: { type: "integer" },
                    colorHex: {
                        column: "color_hex",
                        type: "text",
                        nullable: true,
                        references: { model: "colors", field: "hex" },
                    },
                },
                relations: {
                    colorHex: {
                        type: "N:1",
                        model: "colors",
                        fromField: "colorHex",
                        toField: "hex",
                        optional: true,
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles multi-column foreign key", async () => {
        const table: Table = {
            schema: "public",
            name: "employees",
            columns: [
                {
                    schema: "public",
                    table: "employees",
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
                    table: "employees",
                    column: "company_id",
                    ordinalPosition: 2,
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
                    table: "employees",
                    column: "company_code",
                    ordinalPosition: 3,
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
            ],
            foreignKeys: [
                {
                    schema: "public",
                    constraintName: "employees_company_fkey",
                    tableFrom: "employees",
                    columnsFrom: ["company_id", "company_code"],
                    tableTo: "companies",
                    columnsTo: ["id", "code"],
                },
            ],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const employees = {
                fields: {
                    id: { type: "integer" },
                    companyId: { column: "company_id", type: "integer" },
                    companyCode: { column: "company_code", type: "text" },
                },
                foreignKeys: [
                    {
                        fields: ["companyId", "companyCode"],
                        references: {
                            model: "companies",
                            fields: ["id", "code"],
                        },
                    },
                ],
                relations: {
                    companyCompanyCode: {
                        type: "N:1",
                        model: "companies",
                        fromField: ["companyId", "companyCode"],
                        toField: ["id", "code"],
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });
});
