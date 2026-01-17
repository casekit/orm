import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { orm } from "@casekit/orm";

import { createSchemaSql } from "./createSchemaSql.js";

describe("createSchemaSql", () => {
    const db = orm({ models: {} });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test.for<[string, string]>([
        ["basic schema name", "test_schema"],
        ["schema name with spaces", "test schema"],
        ["malicious", "test-schema;drop table"],
    ])("%s", async ([, schema]) => {
        const result = createSchemaSql(schema);
        expect(result.text).toBe(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
        await db.transact(
            async (db) => {
                await expect(db.query(result)).resolves.not.toThrow();
            },
            { rollback: true },
        );
    });

    test("should throw on empty schema name", () => {
        expect(() => createSchemaSql("")).toThrowError(
            "Cannot create schema with empty name",
        );
    });
});
