import { describe, expect, it } from "vitest";

import type { Table } from "@casekit/orm-migrate";
import { unindent } from "@casekit/unindent";

import { renderModel } from "./renderModel.js";

describe("renderModel - relations", () => {
    it("generates N:1 relation from foreign key", async () => {
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

    it("generates 1:N relation for reverse foreign key", async () => {
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
            primaryKey: null,
            uniqueConstraints: [],
        };

        const allTables: Table[] = [
            table,
            {
                schema: "public",
                name: "posts",
                columns: [
                    {
                        schema: "public",
                        table: "posts",
                        column: "author_id",
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
            },
        ];

        const result = await renderModel(table, allTables);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                    name: { type: "text" },
                },
                relations: {
                    authorPosts: {
                        type: "1:N",
                        model: "posts",
                        fromField: "id",
                        toField: "authorId",
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("generates N:1 relation with non-id foreign key", async () => {
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

    it("generates relation with custom relation name for non-standard foreign key", async () => {
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
                    column: "created_by_user_id",
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
                    constraintName: "posts_created_by_user_id_fkey",
                    tableFrom: "posts",
                    columnsFrom: ["created_by_user_id"],
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
                    createdByUserId: {
                        column: "created_by_user_id",
                        type: "integer",
                        references: { model: "users", field: "id" },
                    },
                },
                relations: {
                    createdByUser: {
                        type: "N:1",
                        model: "users",
                        fromField: "createdByUserId",
                        toField: "id",
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("generates 1:N relation with custom name for reverse foreign key", async () => {
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
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const allTables: Table[] = [
            table,
            {
                schema: "public",
                name: "posts",
                columns: [
                    {
                        schema: "public",
                        table: "posts",
                        column: "created_by_user_id",
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
                foreignKeys: [
                    {
                        schema: "public",
                        constraintName: "posts_created_by_user_id_fkey",
                        tableFrom: "posts",
                        columnsFrom: ["created_by_user_id"],
                        tableTo: "users",
                        columnsTo: ["id"],
                    },
                ],
                primaryKey: null,
                uniqueConstraints: [],
            },
        ];

        const result = await renderModel(table, allTables);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                },
                relations: {
                    createdByUserPosts: {
                        type: "1:N",
                        model: "posts",
                        fromField: "id",
                        toField: "createdByUserId",
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("generates composite foreign key relations", async () => {
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

    it("generates multiple relations from the same table", async () => {
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
                {
                    schema: "public",
                    table: "posts",
                    column: "editor_id",
                    ordinalPosition: 3,
                    type: "integer",
                    default: null,
                    nullable: true,
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
                    column: "category_id",
                    ordinalPosition: 4,
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
                {
                    schema: "public",
                    constraintName: "posts_editor_id_fkey",
                    tableFrom: "posts",
                    columnsFrom: ["editor_id"],
                    tableTo: "users",
                    columnsTo: ["id"],
                },
                {
                    schema: "public",
                    constraintName: "posts_category_id_fkey",
                    tableFrom: "posts",
                    columnsFrom: ["category_id"],
                    tableTo: "categories",
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
                    editorId: {
                        column: "editor_id",
                        type: "integer",
                        nullable: true,
                        references: { model: "users", field: "id" },
                    },
                    categoryId: {
                        column: "category_id",
                        type: "integer",
                        references: { model: "categories", field: "id" },
                    },
                },
                relations: {
                    author: {
                        type: "N:1",
                        model: "users",
                        fromField: "authorId",
                        toField: "id",
                    },
                    editor: {
                        type: "N:1",
                        model: "users",
                        fromField: "editorId",
                        toField: "id",
                        optional: true,
                    },
                    category: {
                        type: "N:1",
                        model: "categories",
                        fromField: "categoryId",
                        toField: "id",
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("generates 1:N relations for multiple incoming foreign keys", async () => {
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
            ],
            foreignKeys: [],
            primaryKey: null,
            uniqueConstraints: [],
        };

        const allTables: Table[] = [
            table,
            {
                schema: "public",
                name: "posts",
                columns: [
                    {
                        schema: "public",
                        table: "posts",
                        column: "author_id",
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
                        column: "editor_id",
                        ordinalPosition: 2,
                        type: "integer",
                        default: null,
                        nullable: true,
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
                    {
                        schema: "public",
                        constraintName: "posts_editor_id_fkey",
                        tableFrom: "posts",
                        columnsFrom: ["editor_id"],
                        tableTo: "users",
                        columnsTo: ["id"],
                    },
                ],
                primaryKey: null,
                uniqueConstraints: [],
            },
            {
                schema: "public",
                name: "comments",
                columns: [
                    {
                        schema: "public",
                        table: "comments",
                        column: "author_id",
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
                foreignKeys: [
                    {
                        schema: "public",
                        constraintName: "comments_author_id_fkey",
                        tableFrom: "comments",
                        columnsFrom: ["author_id"],
                        tableTo: "users",
                        columnsTo: ["id"],
                    },
                ],
                primaryKey: null,
                uniqueConstraints: [],
            },
        ];

        const result = await renderModel(table, allTables);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const users = {
                fields: {
                    id: { type: "integer" },
                },
                relations: {
                    authorPosts: {
                        type: "1:N",
                        model: "posts",
                        fromField: "id",
                        toField: "authorId",
                    },
                    editorPosts: {
                        type: "1:N",
                        model: "posts",
                        fromField: "id",
                        toField: "editorId",
                    },
                    authorComments: {
                        type: "1:N",
                        model: "comments",
                        fromField: "id",
                        toField: "authorId",
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles tables with no relations", async () => {
        const table: Table = {
            schema: "public",
            name: "settings",
            columns: [
                {
                    schema: "public",
                    table: "settings",
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
                    table: "settings",
                    column: "key",
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
                    table: "settings",
                    column: "value",
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
            uniqueConstraints: [],
        };

        const result = await renderModel(table, []);

        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const settings = {
                fields: {
                    id: { type: "integer" },
                    key: { type: "text" },
                    value: { type: "text" },
                },
            } as const satisfies ModelDefinition;
        `);
    });
});
