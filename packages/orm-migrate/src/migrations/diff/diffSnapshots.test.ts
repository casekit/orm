import { describe, expect, test } from "vitest";

import type { SchemaSnapshot, TableSnapshot } from "../types.js";
import { diffSnapshots } from "./diffSnapshots.js";

const emptySnapshot: SchemaSnapshot = {
    schemas: [],
    extensions: [],
    tables: [],
};

const makeTable = (
    overrides: Partial<Omit<TableSnapshot, "primaryKey">> & {
        name: string;
        primaryKey?: string[];
    },
): TableSnapshot => {
    const { primaryKey: pkColumns, ...rest } = overrides;
    return {
        schema: "app",
        columns: [],
        primaryKey: {
            name: pkColumns?.length ? `${overrides.name}_pkey` : null,
            columns: pkColumns ?? [],
        },
        foreignKeys: [],
        uniqueConstraints: [],
        ...rest,
    };
};

describe("diffSnapshots", () => {
    test("returns no operations when snapshots are identical", () => {
        const snapshot: SchemaSnapshot = {
            schemas: ["app"],
            extensions: [{ name: "uuid-ossp", schema: "app" }],
            tables: [
                makeTable({
                    name: "users",
                    columns: [
                        {
                            name: "id",
                            type: "serial",
                            nullable: false,
                            default: null,
                        },
                    ],
                    primaryKey: ["id"],
                }),
            ],
        };

        const ops = diffSnapshots(snapshot, snapshot);
        expect(ops).toEqual([]);
    });

    describe("schemas", () => {
        test("detects added schema", () => {
            const current = emptySnapshot;
            const desired: SchemaSnapshot = {
                ...emptySnapshot,
                schemas: ["app"],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "createSchema",
                schema: "app",
            });
        });

        test("detects removed schema", () => {
            const current: SchemaSnapshot = {
                ...emptySnapshot,
                schemas: ["app"],
            };
            const desired = emptySnapshot;

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropSchema",
                schema: "app",
            });
        });
    });

    describe("extensions", () => {
        test("detects added extension", () => {
            const current: SchemaSnapshot = {
                ...emptySnapshot,
                schemas: ["app"],
            };
            const desired: SchemaSnapshot = {
                ...emptySnapshot,
                schemas: ["app"],
                extensions: [{ name: "uuid-ossp", schema: "app" }],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "createExtension",
                name: "uuid-ossp",
                schema: "app",
            });
        });

        test("detects removed extension", () => {
            const current: SchemaSnapshot = {
                ...emptySnapshot,
                schemas: ["app"],
                extensions: [{ name: "uuid-ossp", schema: "app" }],
            };
            const desired: SchemaSnapshot = {
                ...emptySnapshot,
                schemas: ["app"],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropExtension",
                name: "uuid-ossp",
                schema: "app",
            });
        });
    });

    describe("tables", () => {
        test("detects new table", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "id",
                                type: "serial",
                                nullable: false,
                                default: null,
                            },
                        ],
                        primaryKey: ["id"],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "createTable",
                table: desired.tables[0],
            });
        });

        test("detects dropped table", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "old_table" })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropTable",
                schema: "app",
                table: "old_table",
            });
        });
    });

    describe("columns", () => {
        test("detects added column", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "id",
                                type: "serial",
                                nullable: false,
                                default: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "id",
                                type: "serial",
                                nullable: false,
                                default: null,
                            },
                            {
                                name: "email",
                                type: "text",
                                nullable: false,
                                default: null,
                            },
                        ],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "addColumn",
                schema: "app",
                table: "users",
                column: {
                    name: "email",
                    type: "text",
                    nullable: false,
                    default: null,
                },
            });
        });

        test("detects dropped column", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "id",
                                type: "serial",
                                nullable: false,
                                default: null,
                            },
                            {
                                name: "legacy",
                                type: "text",
                                nullable: true,
                                default: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "id",
                                type: "serial",
                                nullable: false,
                                default: null,
                            },
                        ],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropColumn",
                schema: "app",
                table: "users",
                column: "legacy",
            });
        });

        test("detects type change", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "age",
                                type: "text",
                                nullable: true,
                                default: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "age",
                                type: "integer",
                                nullable: true,
                                default: null,
                            },
                        ],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "age",
                changes: { type: { from: "text", to: "integer" } },
            });
        });

        test("detects nullability change", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "email",
                                type: "text",
                                nullable: true,
                                default: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "email",
                                type: "text",
                                nullable: false,
                                default: null,
                            },
                        ],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "email",
                changes: { nullable: { from: true, to: false } },
            });
        });

        test("detects default change", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "role",
                                type: "text",
                                nullable: false,
                                default: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "role",
                                type: "text",
                                nullable: false,
                                default: "'user'",
                            },
                        ],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "role",
                changes: { default: { from: null, to: "'user'" } },
            });
        });

        test("detects multiple changes on the same column", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "status",
                                type: "text",
                                nullable: true,
                                default: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        columns: [
                            {
                                name: "status",
                                type: "varchar(50)",
                                nullable: false,
                                default: "'active'",
                            },
                        ],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "alterColumn",
                schema: "app",
                table: "users",
                column: "status",
                changes: {
                    type: { from: "text", to: "varchar(50)" },
                    nullable: { from: true, to: false },
                    default: { from: null, to: "'active'" },
                },
            });
        });

        test("does not emit alterColumn when column is unchanged", () => {
            const col = {
                name: "id",
                type: "serial",
                nullable: false,
                default: null,
            };
            const snapshot: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", columns: [col] })],
            };

            const ops = diffSnapshots(snapshot, snapshot);
            expect(ops).toEqual([]);
        });
    });

    describe("foreign keys", () => {
        test("detects added foreign key", () => {
            const fk = {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: null,
                onUpdate: null,
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts" })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [fk] })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "addForeignKey",
                schema: "app",
                table: "posts",
                foreignKey: fk,
            });
        });

        test("detects dropped foreign key", () => {
            const fk = {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: null,
                onUpdate: null,
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [fk] })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts" })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropForeignKey",
                schema: "app",
                table: "posts",
                constraintName: "fk_posts_user",
            });
        });

        test("detects changed foreign key (drop + add)", () => {
            const oldFk = {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: null,
                onUpdate: null,
            };
            const newFk = {
                ...oldFk,
                onDelete: "CASCADE",
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [oldFk] })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [newFk] })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropForeignKey",
                schema: "app",
                table: "posts",
                constraintName: "fk_posts_user",
            });
            expect(ops).toContainEqual({
                type: "addForeignKey",
                schema: "app",
                table: "posts",
                foreignKey: newFk,
            });
        });

        test("detects renamed foreign key (same content, different name)", () => {
            const oldFk = {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: null,
                onUpdate: null,
            };
            const newFk = {
                ...oldFk,
                name: "posts_user_id_fkey",
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [oldFk] })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [newFk] })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "renameForeignKey",
                schema: "app",
                table: "posts",
                oldName: "fk_posts_user",
                newName: "posts_user_id_fkey",
            });
            expect(ops).not.toContainEqual(
                expect.objectContaining({ type: "dropForeignKey" }),
            );
            expect(ops).not.toContainEqual(
                expect.objectContaining({ type: "addForeignKey" }),
            );
        });

        test("does not emit rename when foreign key is unchanged", () => {
            const fk = {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: null,
                onUpdate: null,
            };

            const snapshot: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts", foreignKeys: [fk] })],
            };

            const ops = diffSnapshots(snapshot, snapshot);
            expect(ops).toEqual([]);
        });
    });

    describe("unique constraints", () => {
        test("detects added unique constraint", () => {
            const uc = {
                name: "users_email_key",
                columns: ["email"],
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users" })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", uniqueConstraints: [uc] })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "addUniqueConstraint",
                schema: "app",
                table: "users",
                constraint: uc,
            });
        });

        test("detects dropped unique constraint", () => {
            const uc = {
                name: "users_email_key",
                columns: ["email"],
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", uniqueConstraints: [uc] })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users" })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "dropUniqueConstraint",
                schema: "app",
                table: "users",
                constraintName: "users_email_key",
            });
        });

        test("detects renamed unique constraint (same content, different name)", () => {
            const oldUc = {
                name: "users_email_key",
                columns: ["email"],
            };
            const newUc = {
                ...oldUc,
                name: "users_email_unique",
            };

            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", uniqueConstraints: [oldUc] })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", uniqueConstraints: [newUc] })],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "renameUniqueConstraint",
                schema: "app",
                table: "users",
                oldName: "users_email_key",
                newName: "users_email_unique",
            });
            expect(ops).not.toContainEqual(
                expect.objectContaining({ type: "dropUniqueConstraint" }),
            );
            expect(ops).not.toContainEqual(
                expect.objectContaining({ type: "addUniqueConstraint" }),
            );
        });

        test("does not emit rename when unique constraint is unchanged", () => {
            const uc = {
                name: "users_email_key",
                columns: ["email"],
            };

            const snapshot: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", uniqueConstraints: [uc] })],
            };

            const ops = diffSnapshots(snapshot, snapshot);
            expect(ops).toEqual([]);
        });
    });

    describe("primary keys", () => {
        test("detects changed primary key", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", primaryKey: ["id"] })],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "users",
                        primaryKey: ["id", "tenant_id"],
                    }),
                ],
            };

            const ops = diffSnapshots(current, desired);
            expect(ops).toContainEqual({
                type: "alterPrimaryKey",
                schema: "app",
                table: "users",
                oldConstraintName: "users_pkey",
                oldColumns: ["id"],
                newColumns: ["id", "tenant_id"],
            });
        });

        test("does not emit when primary key is unchanged", () => {
            const snapshot: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users", primaryKey: ["id"] })],
            };

            const ops = diffSnapshots(snapshot, snapshot);
            expect(ops).toEqual([]);
        });
    });

    describe("operation ordering", () => {
        test("creates schemas before tables", () => {
            const ops = diffSnapshots(emptySnapshot, {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "users" })],
            });

            const createSchemaIdx = ops.findIndex(
                (o) => o.type === "createSchema",
            );
            const createTableIdx = ops.findIndex(
                (o) => o.type === "createTable",
            );
            expect(createSchemaIdx).toBeLessThan(createTableIdx);
        });

        test("drops foreign keys before dropping columns", () => {
            const current: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [
                    makeTable({
                        name: "posts",
                        columns: [
                            {
                                name: "user_id",
                                type: "integer",
                                nullable: false,
                                default: null,
                            },
                        ],
                        foreignKeys: [
                            {
                                name: "fk_posts_user",
                                columns: ["user_id"],
                                referencesSchema: "app",
                                referencesTable: "users",
                                referencesColumns: ["id"],
                                onDelete: null,
                                onUpdate: null,
                            },
                        ],
                    }),
                ],
            };
            const desired: SchemaSnapshot = {
                schemas: ["app"],
                extensions: [],
                tables: [makeTable({ name: "posts" })],
            };

            const ops = diffSnapshots(current, desired);
            const dropFkIdx = ops.findIndex((o) => o.type === "dropForeignKey");
            const dropColIdx = ops.findIndex((o) => o.type === "dropColumn");
            expect(dropFkIdx).toBeLessThan(dropColIdx);
        });

        test("drops tables before schemas", () => {
            const current: SchemaSnapshot = {
                schemas: ["old"],
                extensions: [],
                tables: [makeTable({ name: "users", schema: "old" })],
            };
            const desired = emptySnapshot;

            const ops = diffSnapshots(current, desired);
            const dropTableIdx = ops.findIndex((o) => o.type === "dropTable");
            const dropSchemaIdx = ops.findIndex((o) => o.type === "dropSchema");
            expect(dropTableIdx).toBeLessThan(dropSchemaIdx);
        });
    });
});
