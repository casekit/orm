import { describe, expect, test } from "vitest";

import type { Table } from "#pull.js";
import { pulledToSnapshot } from "./pulledToSnapshot.js";

const makeColumn = (
    overrides: Partial<import("#pull/index.js").Column> & { column: string },
): import("#pull/index.js").Column => ({
    schema: "app",
    table: "users",
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

describe("pulledToSnapshot", () => {
    test("converts a simple table", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "users",
                columns: [
                    makeColumn({
                        column: "id",
                        type: "integer",
                        isSerial: true,
                    }),
                    makeColumn({ column: "name", type: "text" }),
                ],
                primaryKey: {
                    schema: "app",
                    table: "users",
                    constraintName: "users_pkey",
                    columns: ["id"],
                },
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);

        expect(snapshot.schemas).toEqual(["app"]);
        expect(snapshot.extensions).toEqual([]);
        expect(snapshot.tables).toHaveLength(1);
        expect(snapshot.tables[0]!.schema).toBe("app");
        expect(snapshot.tables[0]!.name).toBe("users");
        expect(snapshot.tables[0]!.primaryKey).toEqual({
            name: "users_pkey",
            columns: ["id"],
        });
    });

    test("serial columns are mapped to serial type and null default", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "users",
                columns: [
                    makeColumn({
                        column: "id",
                        type: "integer",
                        isSerial: true,
                        default: "nextval('users_id_seq'::regclass)",
                    }),
                ],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        const col = snapshot.tables[0]!.columns[0]!;
        expect(col.type).toBe("serial");
        expect(col.default).toBeNull();
    });

    test("smallserial and bigserial types", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "items",
                columns: [
                    makeColumn({
                        column: "small_id",
                        type: "smallint",
                        isSerial: true,
                    }),
                    makeColumn({
                        column: "big_id",
                        type: "bigint",
                        isSerial: true,
                    }),
                ],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.columns[0]!.type).toBe("smallserial");
        expect(snapshot.tables[0]!.columns[1]!.type).toBe("bigserial");
    });

    test("array columns", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "items",
                columns: [
                    makeColumn({
                        column: "tags",
                        type: "ARRAY",
                        elementType: "text",
                        cardinality: 1,
                    }),
                ],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.columns[0]!.type).toBe("text[]");
    });

    test("sized character types", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "items",
                columns: [
                    makeColumn({
                        column: "code",
                        type: "character varying",
                        size: 50,
                    }),
                ],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.columns[0]!.type).toBe("varchar(50)");
    });

    test("converts foreign keys with actions", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "posts",
                columns: [makeColumn({ column: "user_id", type: "integer" })],
                primaryKey: null,
                foreignKeys: [
                    {
                        schema: "app",
                        constraintName: "fk_posts_user",
                        tableFrom: "posts",
                        columnsFrom: ["user_id"],
                        tableTo: "users",
                        columnsTo: ["id"],
                        onDelete: "CASCADE",
                        onUpdate: null,
                    },
                ],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.foreignKeys).toEqual([
            {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: "CASCADE",
                onUpdate: null,
            },
        ]);
    });

    test("converts unique constraints", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "users",
                columns: [makeColumn({ column: "email", type: "text" })],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [
                    {
                        schema: "app",
                        table: "users",
                        name: "users_email_key",
                        columns: ["email"],
                        definition:
                            "CREATE UNIQUE INDEX users_email_key ON app.users USING btree (email)",
                        nullsNotDistinct: false,
                    },
                ],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.uniqueConstraints).toEqual([
            {
                name: "users_email_key",
                columns: ["email"],
                nullsNotDistinct: false,
                where: null,
            },
        ]);
    });

    test("extracts WHERE clause from unique constraint definition", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "users",
                columns: [makeColumn({ column: "email", type: "text" })],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [
                    {
                        schema: "app",
                        table: "users",
                        name: "users_email_active_key",
                        columns: ["email"],
                        definition:
                            "CREATE UNIQUE INDEX users_email_active_key ON app.users USING btree (email) WHERE (deleted_at IS NULL)",
                        nullsNotDistinct: false,
                    },
                ],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.uniqueConstraints[0]!.where).toBe(
            "deleted_at IS NULL",
        );
    });

    test("handles table with no primary key", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "logs",
                columns: [makeColumn({ column: "message", type: "text" })],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.primaryKey).toEqual({
            name: null,
            columns: [],
        });
    });

    test("preserves column defaults for non-serial columns", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "users",
                columns: [
                    makeColumn({
                        column: "role",
                        type: "text",
                        default: "'user'",
                    }),
                ],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.tables[0]!.columns[0]!.default).toBe("'user'");
    });

    test("collects schemas from multiple tables", () => {
        const tables: Table[] = [
            {
                schema: "app",
                name: "users",
                columns: [],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
            {
                schema: "audit",
                name: "logs",
                columns: [],
                primaryKey: null,
                foreignKeys: [],
                uniqueConstraints: [],
            },
        ];

        const snapshot = pulledToSnapshot(tables);
        expect(snapshot.schemas).toContain("app");
        expect(snapshot.schemas).toContain("audit");
    });
});
