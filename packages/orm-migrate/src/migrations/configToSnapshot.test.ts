import { describe, expect, test } from "vitest";
import { z } from "zod";

import { orm, sql } from "@casekit/orm";

import { configToSnapshot } from "./configToSnapshot.js";

describe("configToSnapshot", () => {
    test("converts a simple model to a snapshot", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        name: { type: "text" },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);

        expect(snapshot.schemas).toEqual(["app"]);
        expect(snapshot.tables).toHaveLength(1);
        expect(snapshot.tables[0]!.schema).toBe("app");
        expect(snapshot.tables[0]!.name).toBe("user");
        expect(snapshot.tables[0]!.primaryKey).toEqual({
            name: "user_pkey",
            columns: ["id"],
        });
        expect(snapshot.tables[0]!.columns).toEqual([
            { name: "id", type: "serial", nullable: false, default: null },
            { name: "name", type: "text", nullable: false, default: null },
        ]);
    });

    test("handles nullable fields", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        bio: { type: "text", nullable: true },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const bioCol = snapshot.tables[0]!.columns.find(
            (c) => c.name === "bio",
        );
        expect(bioCol!.nullable).toBe(true);
    });

    test("handles string defaults", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        role: { type: "text", default: "user" },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const roleCol = snapshot.tables[0]!.columns.find(
            (c) => c.name === "role",
        );
        expect(roleCol!.default).toBe("'user'");
    });

    test("handles SQL statement defaults", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        createdAt: {
                            type: "timestamptz",
                            default: sql`now()`,
                        },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const col = snapshot.tables[0]!.columns.find(
            (c) => c.name === "createdAt",
        );
        expect(col!.default).toBe("now()");
    });

    test("handles numeric defaults", () => {
        const db = orm({
            schema: "app",
            models: {
                item: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        quantity: { type: "integer", default: 0 },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const col = snapshot.tables[0]!.columns.find(
            (c) => c.name === "quantity",
        );
        expect(col!.default).toBe("0");
    });

    test("handles boolean defaults", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        active: { type: "boolean", default: true },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const col = snapshot.tables[0]!.columns.find(
            (c) => c.name === "active",
        );
        expect(col!.default).toBe("true");
    });

    test("converts foreign keys", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                post: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        authorId: { type: "integer" },
                    },
                    foreignKeys: [
                        {
                            fields: ["authorId"],
                            references: {
                                model: "user",
                                fields: ["id"],
                            },
                            onDelete: "CASCADE",
                        },
                    ],
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const postTable = snapshot.tables.find((t) => t.name === "post");
        expect(postTable!.foreignKeys).toHaveLength(1);
        expect(postTable!.foreignKeys[0]).toEqual(
            expect.objectContaining({
                columns: ["authorId"],
                referencesTable: "user",
                referencesColumns: ["id"],
                onDelete: "CASCADE",
            }),
        );
    });

    test("converts unique constraints", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        email: { type: "text" },
                    },
                    uniqueConstraints: [{ fields: ["email"] }],
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        const table = snapshot.tables[0]!;
        expect(table.uniqueConstraints).toHaveLength(1);
        expect(table.uniqueConstraints[0]!.columns).toEqual(["email"]);
    });

    test("converts extensions", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
            extensions: ["uuid-ossp"],
        });

        const snapshot = configToSnapshot(db.config);
        expect(snapshot.extensions).toContainEqual({
            name: "uuid-ossp",
            schema: "app",
        });
    });

    test("collects schemas from multiple models", () => {
        const db = orm({
            schema: "app",
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
                auditLog: {
                    schema: "audit",
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        const snapshot = configToSnapshot(db.config);
        expect(snapshot.schemas).toContain("app");
        expect(snapshot.schemas).toContain("audit");
    });
});
