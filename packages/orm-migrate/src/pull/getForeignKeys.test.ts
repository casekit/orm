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

import { getForeignKeys } from "./getForeignKeys.js";

describe("getForeignKeys", () => {
    const db = orm({
        schema: "migrate-get-foreign-keys-test",
        models: {},
    });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    beforeEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-foreign-keys-test" CASCADE;`;
        await db.query`CREATE SCHEMA IF NOT EXISTS "migrate-get-foreign-keys-test";`;
    });

    afterEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-foreign-keys-test" CASCADE;`;
    });

    test("with an empty database it returns no foreign keys", async () => {
        const statement = getForeignKeys(["migrate-get-foreign-keys-test"]);
        const result = await db.query(statement);
        expect(result).toEqual([]);
    });

    test("returns foreign key relationships", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-foreign-keys-test"."users" (
                        "id" SERIAL PRIMARY KEY,
                        "name" TEXT NOT NULL
                    );
                `);

                await db.query(sql`
                    CREATE TABLE "migrate-get-foreign-keys-test"."posts" (
                        "id" SERIAL PRIMARY KEY,
                        "title" TEXT NOT NULL,
                        "user_id" INTEGER NOT NULL,
                        CONSTRAINT "fk_posts_user_id" FOREIGN KEY ("user_id") REFERENCES "migrate-get-foreign-keys-test"."users" ("id")
                    );
                `);

                const result = await db.query(
                    getForeignKeys(["migrate-get-foreign-keys-test"]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-foreign-keys-test",
                        constraintName: "fk_posts_user_id",
                        tableFrom: "posts",
                        columnsFrom: ["user_id"],
                        tableTo: "users",
                        columnsTo: ["id"],
                    }),
                ]);
            },
            { rollback: true },
        );
    });

    test("handles composite foreign keys", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-foreign-keys-test"."companies" (
                        "id" INTEGER NOT NULL,
                        "code" TEXT NOT NULL,
                        PRIMARY KEY ("id", "code")
                    );
                `);

                await db.query(sql`
                    CREATE TABLE "migrate-get-foreign-keys-test"."employees" (
                        "id" SERIAL PRIMARY KEY,
                        "company_id" INTEGER NOT NULL,
                        "company_code" TEXT NOT NULL,
                        CONSTRAINT "fk_employees_company" FOREIGN KEY ("company_id", "company_code") REFERENCES "migrate-get-foreign-keys-test"."companies" ("id", "code")
                    );
                `);

                const result = await db.query(
                    getForeignKeys(["migrate-get-foreign-keys-test"]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-foreign-keys-test",
                        constraintName: "fk_employees_company",
                        tableFrom: "employees",
                        columnsFrom: ["company_id", "company_code"],
                        tableTo: "companies",
                        columnsTo: ["id", "code"],
                    }),
                ]);
            },
            { rollback: true },
        );
    });
});
