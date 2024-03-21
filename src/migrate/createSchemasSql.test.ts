import { createConfig, createModel, orm } from "@casekit/orm";
import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";
import { z } from "zod";

import { createSchemasSql } from "./createSchemasSql";

describe("createSchemaSql", () => {
    test("it generates a CREATE SCHEMA command for each unique schema used", () => {
        const config = createConfig({});

        const a = createModel({
            schema: "foo",
            columns: {
                id: { type: "uuid", primaryKey: true, schema: z.string() },
            },
        });

        const b = createModel({
            schema: "bar",
            columns: {
                id: { type: "uuid", primaryKey: true, schema: z.string() },
            },
        });

        const db = orm({ config, models: { a, b } });
        expect(createSchemasSql(db.schema)).toEqual(unindent`
        CREATE SCHEMA IF NOT EXISTS foo;

        CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });

    test("it pulls schema from the config if not specified on the model", () => {
        const config = createConfig({ schema: "foo" });

        const a = createModel({
            columns: {
                id: { type: "uuid", primaryKey: true, schema: z.string() },
            },
        });

        const b = createModel({
            schema: "bar",
            columns: {
                id: { type: "uuid", primaryKey: true, schema: z.string() },
            },
        });

        const db = orm({ config, models: { a, b } });
        expect(createSchemasSql(db.schema)).toEqual(unindent`
        CREATE SCHEMA IF NOT EXISTS foo;

        CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });

    test("if no schema is specified at all, it tries to create the public schema", () => {
        const config = createConfig({});

        const a = createModel({
            columns: {
                id: { type: "uuid", primaryKey: true, schema: z.string() },
            },
        });

        const b = createModel({
            schema: "bar",
            columns: {
                id: { type: "uuid", primaryKey: true, schema: z.string() },
            },
        });

        const db = orm({ config, models: { a, b } });
        expect(createSchemasSql(db.schema)).toEqual(unindent`
        CREATE SCHEMA IF NOT EXISTS public;

        CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });
});
