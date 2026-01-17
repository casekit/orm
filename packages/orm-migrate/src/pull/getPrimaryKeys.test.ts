import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { orm, sql } from "@casekit/orm";

import { getPrimaryKeys } from "./getPrimaryKeys.js";

describe("getPrimaryKeys", () => {
    const db = orm({
        schema: "migrate-get-primary-keys-test",
        models: {},
    });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    beforeEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-primary-keys-test" CASCADE;`;
        await db.query`CREATE SCHEMA IF NOT EXISTS "migrate-get-primary-keys-test";`;
    });

    afterEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-primary-keys-test" CASCADE;`;
    });

    test("with an empty database it returns no primary keys", async () => {
        const statement = getPrimaryKeys(["migrate-get-primary-keys-test"]);
        const result = await db.query(statement);
        expect(result).toEqual([]);
    });

    test("returns single column primary key", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-primary-keys-test"."users" (
                        "id" SERIAL PRIMARY KEY,
                        "name" TEXT NOT NULL
                    );
                `);

                const result = await db.query(
                    getPrimaryKeys(["migrate-get-primary-keys-test"]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-primary-keys-test",
                        table: "users",
                        constraintName: "users_pkey",
                        columns: ["id"],
                    }),
                ]);
            },
            { rollback: true },
        );
    });

    test("returns composite primary key with correct order", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-primary-keys-test"."user_roles" (
                        "user_id" INTEGER NOT NULL,
                        "role_id" INTEGER NOT NULL,
                        "granted_at" TIMESTAMP DEFAULT NOW(),
                        PRIMARY KEY ("user_id", "role_id")
                    );
                `);

                const result = await db.query(
                    getPrimaryKeys(["migrate-get-primary-keys-test"]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-primary-keys-test",
                        table: "user_roles",
                        constraintName: "user_roles_pkey",
                        columns: ["user_id", "role_id"],
                    }),
                ]);
            },
            { rollback: true },
        );
    });

    test("returns named primary key constraint", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-primary-keys-test"."products" (
                        "id" UUID NOT NULL,
                        "name" TEXT NOT NULL,
                        CONSTRAINT "pk_products_id" PRIMARY KEY ("id")
                    );
                `);

                const result = await db.query(
                    getPrimaryKeys(["migrate-get-primary-keys-test"]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-primary-keys-test",
                        table: "products",
                        constraintName: "pk_products_id",
                        columns: ["id"],
                    }),
                ]);
            },
            { rollback: true },
        );
    });
});
