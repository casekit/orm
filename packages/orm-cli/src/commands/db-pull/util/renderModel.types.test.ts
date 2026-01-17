import { describe, expect, it } from "vitest";

import type { Table } from "@casekit/orm-migrate";
import { unindent } from "@casekit/unindent";

import { renderModel } from "./renderModel.js";

describe("renderModel - types", () => {
    it("handles basic PostgreSQL types", async () => {
        const table: Table = {
            schema: "public",
            name: "types_test",
            columns: [
                {
                    schema: "public",
                    table: "types_test",
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
                    table: "types_test",
                    column: "small_num",
                    ordinalPosition: 2,
                    type: "smallint",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "int2",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "types_test",
                    column: "big_num",
                    ordinalPosition: 3,
                    type: "bigint",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "int8",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "types_test",
                    column: "price",
                    ordinalPosition: 4,
                    type: "numeric",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "numeric",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "types_test",
                    column: "rating",
                    ordinalPosition: 5,
                    type: "real",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "float4",
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

            export const typesTest = {
                table: "types_test",
                fields: {
                    id: { type: "integer" },
                    smallNum: { column: "small_num", type: "smallint" },
                    bigNum: { column: "big_num", type: "bigint" },
                    price: { type: "numeric" },
                    rating: { type: "real" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles character and text types", async () => {
        const table: Table = {
            schema: "public",
            name: "text_test",
            columns: [
                {
                    schema: "public",
                    table: "text_test",
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
                    table: "text_test",
                    column: "description",
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
                    table: "text_test",
                    column: "name",
                    ordinalPosition: 3,
                    type: "character varying",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "varchar",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: 100,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "text_test",
                    column: "code",
                    ordinalPosition: 4,
                    type: "character",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "bpchar",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: 10,
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

            export const textTest = {
                table: "text_test",
                fields: {
                    id: { type: "integer" },
                    description: { type: "text" },
                    name: { type: "character varying" },
                    code: { type: "character" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles date and time types", async () => {
        const table: Table = {
            schema: "public",
            name: "time_test",
            columns: [
                {
                    schema: "public",
                    table: "time_test",
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
                    table: "time_test",
                    column: "birthday",
                    ordinalPosition: 2,
                    type: "date",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "date",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "time_test",
                    column: "created_at",
                    ordinalPosition: 3,
                    type: "timestamp without time zone",
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
                {
                    schema: "public",
                    table: "time_test",
                    column: "updated_at",
                    ordinalPosition: 4,
                    type: "timestamp with time zone",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "timestamptz",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "time_test",
                    column: "lunch_time",
                    ordinalPosition: 5,
                    type: "time without time zone",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "time",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "time_test",
                    column: "meeting_time",
                    ordinalPosition: 6,
                    type: "time with time zone",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "timetz",
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

            export const timeTest = {
                table: "time_test",
                fields: {
                    id: { type: "integer" },
                    birthday: { type: "date" },
                    createdAt: {
                        column: "created_at",
                        type: "timestamp without time zone",
                    },
                    updatedAt: { column: "updated_at", type: "timestamp with time zone" },
                    lunchTime: { column: "lunch_time", type: "time without time zone" },
                    meetingTime: { column: "meeting_time", type: "time with time zone" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles array types", async () => {
        const table: Table = {
            schema: "public",
            name: "array_test",
            columns: [
                {
                    schema: "public",
                    table: "array_test",
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
                    table: "array_test",
                    column: "tags",
                    ordinalPosition: 2,
                    type: "ARRAY",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "_text",
                    elementType: "text",
                    elementTypeSchema: "pg_catalog",
                    cardinality: 1,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "array_test",
                    column: "numbers",
                    ordinalPosition: 3,
                    type: "ARRAY",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "_int4",
                    elementType: "integer",
                    elementTypeSchema: "pg_catalog",
                    cardinality: 1,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "array_test",
                    column: "matrix",
                    ordinalPosition: 4,
                    type: "ARRAY",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "_int4",
                    elementType: "integer",
                    elementTypeSchema: "pg_catalog",
                    cardinality: 2,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "array_test",
                    column: "cube",
                    ordinalPosition: 5,
                    type: "ARRAY",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "_text",
                    elementType: "text",
                    elementTypeSchema: "pg_catalog",
                    cardinality: 3,
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

            export const arrayTest = {
                table: "array_test",
                fields: {
                    id: { type: "integer" },
                    tags: { type: "text[]" },
                    numbers: { type: "integer[]" },
                    matrix: { type: "integer[][]" },
                    cube: { type: "text[][][]" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles JSON and UUID types", async () => {
        const table: Table = {
            schema: "public",
            name: "special_test",
            columns: [
                {
                    schema: "public",
                    table: "special_test",
                    column: "id",
                    ordinalPosition: 1,
                    type: "uuid",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "uuid",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "special_test",
                    column: "metadata",
                    ordinalPosition: 2,
                    type: "json",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "json",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "special_test",
                    column: "settings",
                    ordinalPosition: 3,
                    type: "jsonb",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "jsonb",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "special_test",
                    column: "is_active",
                    ordinalPosition: 4,
                    type: "boolean",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "bool",
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

            export const specialTest = {
                table: "special_test",
                fields: {
                    id: { type: "uuid" },
                    metadata: { type: "json" },
                    settings: { type: "jsonb" },
                    isActive: { column: "is_active", type: "boolean" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles double precision type mapping", async () => {
        const table: Table = {
            schema: "public",
            name: "precision_test",
            columns: [
                {
                    schema: "public",
                    table: "precision_test",
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
                    table: "precision_test",
                    column: "precise_value",
                    ordinalPosition: 2,
                    type: "double precision",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "float8",
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

            export const precisionTest = {
                table: "precision_test",
                fields: {
                    id: { type: "integer" },
                    preciseValue: { column: "precise_value", type: "double precision" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles custom enum types", async () => {
        const table: Table = {
            schema: "public",
            name: "enum_test",
            columns: [
                {
                    schema: "public",
                    table: "enum_test",
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
                    table: "enum_test",
                    column: "status",
                    ordinalPosition: 2,
                    type: "USER-DEFINED",
                    default: null,
                    nullable: false,
                    udtSchema: "public",
                    udt: "status_enum",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "enum_test",
                    column: "priority",
                    ordinalPosition: 3,
                    type: "USER-DEFINED",
                    default: null,
                    nullable: false,
                    udtSchema: "my_schema",
                    udt: "priority_level",
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

            export const enumTest = {
                table: "enum_test",
                fields: {
                    id: { type: "integer" },
                    status: { type: "USER-DEFINED" },
                    priority: { type: "USER-DEFINED" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles array type with missing cardinality", async () => {
        const table: Table = {
            schema: "public",
            name: "array_fallback_test",
            columns: [
                {
                    schema: "public",
                    table: "array_fallback_test",
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
                    table: "array_fallback_test",
                    column: "items",
                    ordinalPosition: 2,
                    type: "ARRAY",
                    default: null,
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "_text",
                    elementType: "text",
                    elementTypeSchema: "pg_catalog",
                    cardinality: 1, // Fixed cardinality
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

            export const arrayFallbackTest = {
                table: "array_fallback_test",
                fields: {
                    id: { type: "integer" },
                    items: { type: "text[]" },
                },
            } as const satisfies ModelDefinition;
        `);
    });
});
