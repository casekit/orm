import { describe, expect, test } from "vitest";

import { operationToSql, operationsToSql } from "./operationToSql.js";
import type { SchemaDiffOperation } from "./types.js";

describe("operationToSql", () => {
    test("createSchema", () => {
        const sql = operationToSql({
            type: "createSchema",
            schema: "app",
        }).text;
        expect(sql).toContain('CREATE SCHEMA IF NOT EXISTS "app"');
    });

    test("dropSchema", () => {
        const sql = operationToSql({
            type: "dropSchema",
            schema: "app",
        }).text;
        expect(sql).toContain('DROP SCHEMA IF EXISTS "app"');
    });

    test("createExtension", () => {
        const sql = operationToSql({
            type: "createExtension",
            name: "uuid-ossp",
            schema: "public",
        }).text;
        expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        expect(sql).toContain('SCHEMA "public"');
    });

    test("dropExtension", () => {
        const sql = operationToSql({
            type: "dropExtension",
            name: "uuid-ossp",
            schema: "public",
        }).text;
        expect(sql).toContain('DROP EXTENSION IF EXISTS "uuid-ossp"');
    });

    test("createTable with columns and primary key", () => {
        const sql = operationToSql({
            type: "createTable",
            table: {
                schema: "app",
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "serial",
                        nullable: false,
                        default: null,
                    },
                    {
                        name: "name",
                        type: "text",
                        nullable: false,
                        default: null,
                    },
                    {
                        name: "email",
                        type: "text",
                        nullable: true,
                        default: null,
                    },
                ],
                primaryKey: { name: "users_pkey", columns: ["id"] },
                foreignKeys: [],
                uniqueConstraints: [],
            },
        }).text;
        expect(sql).toContain('CREATE TABLE "app"."users"');
        expect(sql).toContain('"id" serial NOT NULL');
        expect(sql).toContain('"name" text NOT NULL');
        expect(sql).toContain('"email" text');
        expect(sql).toContain('PRIMARY KEY ("id")');
    });

    test("createTable with column default", () => {
        const sql = operationToSql({
            type: "createTable",
            table: {
                schema: "app",
                name: "users",
                columns: [
                    {
                        name: "role",
                        type: "text",
                        nullable: false,
                        default: "'user'",
                    },
                ],
                primaryKey: { name: null, columns: [] },
                foreignKeys: [],
                uniqueConstraints: [],
            },
        }).text;
        expect(sql).toContain("DEFAULT 'user'");
    });

    test("dropTable", () => {
        const sql = operationToSql({
            type: "dropTable",
            schema: "app",
            table: "users",
        }).text;
        expect(sql).toContain('DROP TABLE IF EXISTS "app"."users"');
    });

    test("addColumn", () => {
        const sql = operationToSql({
            type: "addColumn",
            schema: "app",
            table: "users",
            column: {
                name: "email",
                type: "text",
                nullable: false,
                default: null,
            },
        }).text;
        expect(sql).toContain(
            'ALTER TABLE "app"."users" ADD COLUMN "email" text NOT NULL',
        );
    });

    test("addColumn with default", () => {
        const sql = operationToSql({
            type: "addColumn",
            schema: "app",
            table: "users",
            column: {
                name: "role",
                type: "text",
                nullable: false,
                default: "'user'",
            },
        }).text;
        expect(sql).toContain("DEFAULT 'user'");
    });

    test("dropColumn", () => {
        const sql = operationToSql({
            type: "dropColumn",
            schema: "app",
            table: "users",
            column: "email",
        }).text;
        expect(sql).toContain('ALTER TABLE "app"."users" DROP COLUMN "email"');
    });

    test("alterColumn type change", () => {
        const sql = operationToSql({
            type: "alterColumn",
            schema: "app",
            table: "users",
            column: "age",
            changes: { type: { from: "text", to: "integer" } },
        }).text;
        expect(sql).toContain('ALTER COLUMN "age" TYPE integer');
    });

    test("alterColumn set NOT NULL", () => {
        const sql = operationToSql({
            type: "alterColumn",
            schema: "app",
            table: "users",
            column: "email",
            changes: { nullable: { from: true, to: false } },
        }).text;
        expect(sql).toContain('ALTER COLUMN "email" SET NOT NULL');
    });

    test("alterColumn drop NOT NULL", () => {
        const sql = operationToSql({
            type: "alterColumn",
            schema: "app",
            table: "users",
            column: "email",
            changes: { nullable: { from: false, to: true } },
        }).text;
        expect(sql).toContain('ALTER COLUMN "email" DROP NOT NULL');
    });

    test("alterColumn set default", () => {
        const sql = operationToSql({
            type: "alterColumn",
            schema: "app",
            table: "users",
            column: "role",
            changes: { default: { from: null, to: "'admin'" } },
        }).text;
        expect(sql).toContain("SET DEFAULT 'admin'");
    });

    test("alterColumn drop default", () => {
        const sql = operationToSql({
            type: "alterColumn",
            schema: "app",
            table: "users",
            column: "role",
            changes: { default: { from: "'user'", to: null } },
        }).text;
        expect(sql).toContain("DROP DEFAULT");
    });

    test("addForeignKey", () => {
        const sql = operationToSql({
            type: "addForeignKey",
            schema: "app",
            table: "posts",
            foreignKey: {
                name: "fk_posts_user",
                columns: ["user_id"],
                referencesSchema: "app",
                referencesTable: "users",
                referencesColumns: ["id"],
                onDelete: "CASCADE",
                onUpdate: null,
            },
        }).text;
        expect(sql).toContain('ADD CONSTRAINT "fk_posts_user"');
        expect(sql).toContain('FOREIGN KEY ("user_id")');
        expect(sql).toContain('REFERENCES "app"."users" ("id")');
        expect(sql).toContain("ON DELETE CASCADE");
        expect(sql).not.toContain("ON UPDATE");
    });

    test("dropForeignKey", () => {
        const sql = operationToSql({
            type: "dropForeignKey",
            schema: "app",
            table: "posts",
            constraintName: "fk_posts_user",
        }).text;
        expect(sql).toContain('DROP CONSTRAINT "fk_posts_user"');
    });

    test("addUniqueConstraint", () => {
        const sql = operationToSql({
            type: "addUniqueConstraint",
            schema: "app",
            table: "users",
            constraint: {
                name: "users_email_key",
                columns: ["email"],
            },
        }).text;
        expect(sql).toContain('CREATE UNIQUE INDEX "users_email_key"');
        expect(sql).toContain('ON "app"."users" ("email")');
    });

    test("addUniqueConstraint with nullsNotDistinct", () => {
        const sql = operationToSql({
            type: "addUniqueConstraint",
            schema: "app",
            table: "users",
            constraint: {
                name: "users_email_key",
                columns: ["email"],
                nullsNotDistinct: true,
            },
        }).text;
        expect(sql).toContain("NULLS NOT DISTINCT");
    });

    test("addUniqueConstraint with where clause", () => {
        const sql = operationToSql({
            type: "addUniqueConstraint",
            schema: "app",
            table: "users",
            constraint: {
                name: "users_email_key",
                columns: ["email"],
                where: "deleted_at IS NULL",
            },
        }).text;
        expect(sql).toContain("WHERE (deleted_at IS NULL)");
    });

    test("dropUniqueConstraint", () => {
        const sql = operationToSql({
            type: "dropUniqueConstraint",
            schema: "app",
            table: "users",
            constraintName: "users_email_key",
        }).text;
        expect(sql).toContain('DROP INDEX IF EXISTS "app"."users_email_key"');
    });

    test("alterPrimaryKey", () => {
        const sql = operationToSql({
            type: "alterPrimaryKey",
            schema: "app",
            table: "users",
            oldConstraintName: "users_pkey",
            oldColumns: ["id"],
            newColumns: ["id", "tenant_id"],
        }).text;
        expect(sql).toContain("DROP CONSTRAINT");
        expect(sql).toContain('ADD PRIMARY KEY ("id", "tenant_id")');
    });

    test("renameColumn", () => {
        const sql = operationToSql({
            type: "renameColumn",
            schema: "app",
            table: "users",
            oldName: "old_name",
            newName: "new_name",
        }).text;
        expect(sql).toBe(
            'ALTER TABLE "app"."users" RENAME COLUMN "old_name" TO "new_name";',
        );
    });
});

describe("operationsToSql", () => {
    test("converts multiple operations to trimmed SQL strings", () => {
        const ops: SchemaDiffOperation[] = [
            { type: "createSchema", schema: "app" },
            { type: "dropSchema", schema: "old" },
        ];
        const sqls = operationsToSql(ops);
        expect(sqls).toHaveLength(2);
        expect(sqls[0]).toContain("CREATE SCHEMA");
        expect(sqls[1]).toContain("DROP SCHEMA");
        // Should be trimmed
        expect(sqls[0]![0]).not.toBe(" ");
        expect(sqls[0]![0]).not.toBe("\n");
    });
});
