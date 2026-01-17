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

import { getUniqueConstraints } from "./getUniqueConstraints.js";

describe("getUniqueConstraints", () => {
    const db = orm({
        schema: "migrate-get-unique-constraints-test",
        models: {},
    });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    beforeEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-unique-constraints-test" CASCADE;`;
        await db.query`CREATE SCHEMA IF NOT EXISTS "migrate-get-unique-constraints-test";`;
    });

    afterEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-unique-constraints-test" CASCADE;`;
    });

    test("with an empty database it returns no unique constraints", async () => {
        const statement = getUniqueConstraints([
            "migrate-get-unique-constraints-test",
        ]);
        const result = await db.query(statement);
        expect(result).toEqual([]);
    });

    test("returns unique index constraints", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-unique-constraints-test"."users" (
                        "id" SERIAL PRIMARY KEY,
                        "email" TEXT NOT NULL
                    );
                `);

                await db.query(sql`
                    CREATE UNIQUE INDEX "idx_users_email" ON "migrate-get-unique-constraints-test"."users" ("email");
                `);

                const result = await db.query(
                    getUniqueConstraints([
                        "migrate-get-unique-constraints-test",
                    ]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-unique-constraints-test",
                        table: "users",
                        name: "idx_users_email",
                        definition: expect.stringContaining(
                            "CREATE UNIQUE INDEX idx_users_email",
                        ),
                    }),
                ]);
            },
            { rollback: true },
        );
    });

    test("returns composite unique index constraints", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-unique-constraints-test"."products" (
                        "id" SERIAL PRIMARY KEY,
                        "name" TEXT NOT NULL,
                        "category" TEXT NOT NULL
                    );
                `);

                await db.query(sql`
                    CREATE UNIQUE INDEX "idx_products_name_category" ON "migrate-get-unique-constraints-test"."products" ("name", "category");
                `);

                const result = await db.query(
                    getUniqueConstraints([
                        "migrate-get-unique-constraints-test",
                    ]),
                );

                expect(result).toEqual([
                    expect.objectContaining({
                        schema: "migrate-get-unique-constraints-test",
                        table: "products",
                        name: "idx_products_name_category",
                        definition: expect.stringContaining(
                            "CREATE UNIQUE INDEX idx_products_name_category",
                        ),
                    }),
                ]);
            },
            { rollback: true },
        );
    });

    test("excludes primary key constraints", async () => {
        await db.transact(
            async (db) => {
                await db.query(sql`
                    CREATE TABLE "migrate-get-unique-constraints-test"."users" (
                        "id" SERIAL PRIMARY KEY,
                        "email" TEXT UNIQUE
                    );
                `);

                const result = await db.query(
                    getUniqueConstraints([
                        "migrate-get-unique-constraints-test",
                    ]),
                );

                // Should only return the unique constraint on email, not the primary key
                expect(result).toHaveLength(1);
                expect(result[0]).toEqual(
                    expect.objectContaining({
                        schema: "migrate-get-unique-constraints-test",
                        table: "users",
                        definition: expect.stringContaining("email"),
                    }),
                );
                expect(result[0]!.definition).not.toContain("id");
            },
            { rollback: true },
        );
    });
});
