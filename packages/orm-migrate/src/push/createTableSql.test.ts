import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { FieldDefinition, orm, sql } from "@casekit/orm";
import { normalizeConfig } from "@casekit/orm-config";
import { config } from "@casekit/orm-fixtures";
import { unindent } from "@casekit/unindent";

import { createTableSql } from "./createTableSql.js";

describe("createTableSql", () => {
    const db = orm(config);

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test.for<[FieldDefinition["type"], Partial<FieldDefinition>, string]>([
        [
            "integer",
            {},
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" integer NOT NULL,
                    PRIMARY KEY ("id")
                );
            `,
        ],
        [
            "text",
            { nullable: true },
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" text,
                    PRIMARY KEY ("id")
                );
            `,
        ],
        [
            "integer",
            { unique: true, default: 1312 },
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" integer NOT NULL DEFAULT '1312',
                    PRIMARY KEY ("id")
                );
            `,
        ],
        [
            "text",
            { unique: true, default: "foo" },
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" text NOT NULL DEFAULT 'foo',
                    PRIMARY KEY ("id")
                );
            `,
        ],
        [
            "uuid",
            { default: sql`uuid_generate_v4()` },
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" uuid NOT NULL DEFAULT uuid_generate_v4 (),
                    PRIMARY KEY ("id")
                );
            `,
        ],
        [
            "text[][][]",
            { default: [[[1, 2, 3]]] },
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" text[] [] [] NOT NULL DEFAULT '{ { { 1, 2, 3 } } }',
                    PRIMARY KEY ("id")
                );
            `,
        ],
        [
            "timestamp without time zone",
            { default: sql`now()` },
            unindent`
                CREATE TABLE IF NOT EXISTS "public"."foo" (
                    "id" serial NOT NULL,
                    "value" timestamp without time zone NOT NULL DEFAULT now(),
                    PRIMARY KEY ("id")
                );
            `,
        ],
    ])("%s %s", async ([type, options, expected]) => {
        const config = normalizeConfig({
            models: {
                foo: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        value: { type: type, ...options },
                    },
                },
            },
        });

        const statement = createTableSql(config.models["foo"]!);
        expect(statement.pretty).toEqual(expected);
        await db.transact(
            async (db) => {
                await expect(db.query(statement)).resolves.not.toThrow();
            },
            { rollback: true },
        );
    });
});
