import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { orm } from "@casekit/orm";

import { createExtensionsSql } from "./createExtensionSql.js";

describe("createExtensionsSql", () => {
    const db = orm({ models: {} });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test("creates SQL statement for creating an extension", async () => {
        const statement = createExtensionsSql("foo", "uuid-ossp");
        expect(statement.text).toEqual(
            'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "foo";',
        );
        expect(statement.values).toEqual([]);
        await db.transact(
            async (db) => {
                await expect(db.query(statement)).resolves.not.toThrow();
            },
            { rollback: true },
        );
    });
});
