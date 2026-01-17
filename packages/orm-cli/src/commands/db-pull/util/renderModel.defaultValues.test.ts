import { describe, expect, it } from "vitest";

import type { Table } from "@casekit/orm-migrate";
import { unindent } from "@casekit/unindent";

import { renderModel } from "./renderModel.js";

describe("renderModel - default values", () => {
    it("handles numeric defaults", async () => {
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
                    column: "price",
                    ordinalPosition: 2,
                    type: "numeric",
                    default: "0",
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
                    table: "products",
                    column: "discount",
                    ordinalPosition: 3,
                    type: "numeric",
                    default: "0.15",
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "numeric",
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

            export const products = {
                fields: {
                    id: { type: "integer" },
                    price: { type: "numeric", default: 0 },
                    discount: { type: "numeric", default: 0.15 },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles boolean defaults", async () => {
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
                    column: "is_active",
                    ordinalPosition: 2,
                    type: "boolean",
                    default: "true",
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "bool",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "settings",
                    column: "is_deleted",
                    ordinalPosition: 3,
                    type: "boolean",
                    default: "false",
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

            export const settings = {
                fields: {
                    id: { type: "integer" },
                    isActive: { column: "is_active", type: "boolean", default: true },
                    isDeleted: { column: "is_deleted", type: "boolean", default: false },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles string literal defaults", async () => {
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
                    column: "status",
                    ordinalPosition: 2,
                    type: "text",
                    default: "'active'::text",
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
                    column: "role",
                    ordinalPosition: 3,
                    type: "text",
                    default: "'user'::text",
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

            export const users = {
                fields: {
                    id: { type: "integer" },
                    status: { type: "text", default: "active" },
                    role: { type: "text", default: "user" },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles SQL function defaults", async () => {
        const table: Table = {
            schema: "public",
            name: "events",
            columns: [
                {
                    schema: "public",
                    table: "events",
                    column: "id",
                    ordinalPosition: 1,
                    type: "uuid",
                    default: "gen_random_uuid()",
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
                    table: "events",
                    column: "created_at",
                    ordinalPosition: 2,
                    type: "timestamp",
                    default: "now()",
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
                    table: "events",
                    column: "event_date",
                    ordinalPosition: 3,
                    type: "date",
                    default: "CURRENT_DATE",
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "date",
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
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const events = {
                fields: {
                    id: { type: "uuid", default: sql\`gen_random_uuid()\` },
                    createdAt: {
                        column: "created_at",
                        type: "timestamp",
                        default: sql\`now()\`,
                    },
                    eventDate: {
                        column: "event_date",
                        type: "date",
                        default: sql\`CURRENT_DATE\`,
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles serial columns with nextval defaults", async () => {
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
                    default: "nextval('posts_id_seq'::regclass)",
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
                    column: "sequence_num",
                    ordinalPosition: 2,
                    type: "bigint",
                    default: "nextval('posts_sequence_num_seq'::regclass)",
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "int8",
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
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const posts = {
                fields: {
                    id: {
                        type: "integer",
                        default: sql\`nextval('posts_id_seq'::regclass)\`,
                    },
                    sequenceNum: {
                        column: "sequence_num",
                        type: "bigint",
                        default: sql\`nextval('posts_sequence_num_seq'::regclass)\`,
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("handles array and JSON defaults", async () => {
        const table: Table = {
            schema: "public",
            name: "configs",
            columns: [
                {
                    schema: "public",
                    table: "configs",
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
                    table: "configs",
                    column: "tags",
                    ordinalPosition: 2,
                    type: "ARRAY",
                    default: "'[]'::text[]",
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
                    table: "configs",
                    column: "metadata",
                    ordinalPosition: 3,
                    type: "jsonb",
                    default: "'{}'::jsonb",
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
                    table: "configs",
                    column: "settings",
                    ordinalPosition: 4,
                    type: "json",
                    default: "'null'::json",
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "json",
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
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const configs = {
                fields: {
                    id: { type: "integer" },
                    tags: { type: "text[]", default: sql\`'[]'::text[]\` },
                    metadata: { type: "jsonb", default: sql\`'{}'::jsonb\` },
                    settings: { type: "json", default: sql\`'null'::json\` },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    it("imports sql only when needed for defaults", async () => {
        const table: Table = {
            schema: "public",
            name: "simple",
            columns: [
                {
                    schema: "public",
                    table: "simple",
                    column: "id",
                    ordinalPosition: 1,
                    type: "integer",
                    default: "42",
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
                    table: "simple",
                    column: "active",
                    ordinalPosition: 2,
                    type: "boolean",
                    default: "true",
                    nullable: false,
                    udtSchema: "pg_catalog",
                    udt: "bool",
                    elementType: null,
                    elementTypeSchema: null,
                    cardinality: 0,
                    size: null,
                    isSerial: false,
                },
                {
                    schema: "public",
                    table: "simple",
                    column: "name",
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

        // Note: no sql import since all defaults are simple values
        expect(result.trim()).toBe(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const simple = {
                fields: {
                    id: { type: "integer", default: 42 },
                    active: { type: "boolean", default: true },
                    name: { type: "text", nullable: true },
                },
            } as const satisfies ModelDefinition;
        `);
    });
});
