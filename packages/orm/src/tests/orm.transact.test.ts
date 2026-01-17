import * as uuid from "uuid";
import { describe, expect, test } from "vitest";

import { sql } from "@casekit/sql";

import { orm } from "../orm.js";

describe("orm.transact()", () => {
    test("rolling back a transaction on error", async () => {
        // create a unique table name in case this test fails and
        // the table is not dropped
        const table = sql.ident(`test_${uuid.v4()}`);
        const db = orm({ models: {} });
        await db.connect();
        try {
            await db.query`CREATE TABLE ${table} (id SERIAL PRIMARY KEY)`;
            await db.transact(async (db) => {
                await db.query`INSERT INTO ${table} DEFAULT VALUES`;
                throw new Error("rollback");
            });
        } catch (e) {
            expect((e as Error).message).toBe("rollback");
            const result = await db.query`SELECT * FROM ${table}`;
            expect(result).toEqual([]);
            await db.query`DROP TABLE ${table}`;
        } finally {
            await db.close();
        }
    });

    test("committing a transaction on successful completion of the callback", async () => {
        // create a unique table name in case this test fails and
        // the table is not dropped
        const table = sql.ident(`test_${uuid.v4()}`);
        const db = orm({ models: {} });
        await db.connect();
        try {
            await db.query`CREATE TABLE ${table} (id SERIAL PRIMARY KEY)`;
            await db.transact(async (db) => {
                await db.query`INSERT INTO ${table} DEFAULT VALUES`;
            });
            const result = await db.query`SELECT * FROM ${table}`;
            expect(result).toEqual([{ id: 1 }]);
            await db.query`DROP TABLE ${table}`;
        } finally {
            await db.close();
        }
    });
});
