import pg from "pg";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import yargs from "yargs";

import { dbDrop } from "./db-drop.js";
import { dbPush } from "./db-push.js";

describe("db push", () => {
    let db: pg.Client;

    beforeEach(async () => {
        db = new pg.Client();
        await db.connect();
    });

    afterEach(async () => {
        await db.end();
    });

    test("creates the schema for the models defined in the config", async () => {
        await yargs().command(dbDrop).parseAsync("drop");
        await yargs().command(dbPush).parseAsync("push");
        const result = await db.query(
            "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'orm';",
        );
        expect(result.rows.length).toBe(1);
    });
});
