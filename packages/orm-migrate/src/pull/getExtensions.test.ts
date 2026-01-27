import pg from "pg";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { getExtensions } from "./getExtensions.js";

describe("getExtensions", () => {
    let client: pg.Client;
    const testSchema = "ext_test_schema";

    beforeEach(async () => {
        client = new pg.Client();
        await client.connect();
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);
    });

    afterEach(async () => {
        await client.query(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
        await client.end();
    });

    test("returns empty array when no extensions in schema", async () => {
        const result = await client.query(getExtensions([testSchema]));
        expect(result.rows).toEqual([]);
    });

    test("returns extensions installed in pg_catalog schema", async () => {
        // plpgsql is always installed in pg_catalog
        const result = await client.query<{ name: string }>(
            getExtensions(["pg_catalog"]),
        );

        expect(result.rows.some((e) => e.name === "plpgsql")).toBe(true);
        expect(result.rows[0]).toHaveProperty("name");
        expect(result.rows[0]).toHaveProperty("schema");
    });

    test("only returns extensions from specified schemas", async () => {
        const result = await client.query<{ name: string }>(
            getExtensions([testSchema]),
        );

        // plpgsql is in public, not in our test schema
        expect(result.rows.find((e) => e.name === "plpgsql")).toBeUndefined();
    });
});
