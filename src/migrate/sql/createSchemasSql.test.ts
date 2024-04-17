import { unindent } from "@casekit/unindent";

import pg from "pg";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { ModelDefinition, orm } from "../../";
import { createSchemasSql } from "./createSchemasSql";

describe("createSchemaSql", () => {
    test("it generates a CREATE SCHEMA command for each unique schema used", () => {
        const a = {
            schema: "foo",
            columns: {
                id: { type: "uuid", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        const b = {
            schema: "bar",
            columns: {
                id: { type: "uuid", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        const db = orm({ models: { a, b }, pool: new pg.Pool() });
        expect(createSchemasSql(db).text).toEqual(unindent`
            CREATE SCHEMA IF NOT EXISTS foo;
            CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });

    test("it pulls schema from the config if not specified on the model", () => {
        const a = {
            columns: {
                id: { type: "uuid", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        const b = {
            schema: "bar",
            columns: {
                id: { type: "uuid", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        const db = orm({
            schema: "foo",
            models: { a, b },
            pool: new pg.Pool(),
        });
        expect(createSchemasSql(db).text).toEqual(unindent`
            CREATE SCHEMA IF NOT EXISTS foo;
            CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });

    test("if no schema is specified at all, it tries to create the public schema", () => {
        const a = {
            columns: {
                id: { type: "uuid", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        const b = {
            schema: "bar",
            columns: {
                id: { type: "uuid", zodSchema: z.string() },
            },
        } as const satisfies ModelDefinition;

        const db = orm({
            models: { a, b },
            pool: new pg.Pool(),
        });
        expect(createSchemasSql(db).text).toEqual(unindent`
            CREATE SCHEMA IF NOT EXISTS public;
            CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });
});
