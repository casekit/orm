import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";
import { z } from "zod";

import { orm } from "../../";
import { ModelDefinition } from "../../types/schema/definitions/ModelDefinition";
import { createSchemasSql } from "./createSchemasSql";

describe("createSchemaSql", () => {
    test("it generates a CREATE SCHEMA command for each unique schema used", () => {
        const a = {
            schema: "foo",
            columns: {
                id: { type: "uuid", schema: z.string() },
            },
        } satisfies ModelDefinition;

        const b = {
            schema: "bar",
            columns: {
                id: { type: "uuid", schema: z.string() },
            },
        } satisfies ModelDefinition;

        const db = orm({ models: { a, b } });
        expect(createSchemasSql(db).text).toEqual(unindent`
            CREATE SCHEMA IF NOT EXISTS foo;
            CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });

    test("it pulls schema from the config if not specified on the model", () => {
        const a = {
            columns: {
                id: { type: "uuid", schema: z.string() },
            },
        } satisfies ModelDefinition;

        const b = {
            schema: "bar",
            columns: {
                id: { type: "uuid", schema: z.string() },
            },
        } satisfies ModelDefinition;

        const db = orm({ schema: "foo", models: { a, b } });
        expect(createSchemasSql(db).text).toEqual(unindent`
            CREATE SCHEMA IF NOT EXISTS foo;
            CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });

    test("if no schema is specified at all, it tries to create the public schema", () => {
        const a = {
            columns: {
                id: { type: "uuid", schema: z.string() },
            },
        } satisfies ModelDefinition;

        const b = {
            schema: "bar",
            columns: {
                id: { type: "uuid", schema: z.string() },
            },
        } satisfies ModelDefinition;

        const db = orm({
            models: { a, b },
        });
        expect(createSchemasSql(db).text).toEqual(unindent`
            CREATE SCHEMA IF NOT EXISTS public;
            CREATE SCHEMA IF NOT EXISTS bar;
        `);
    });
});
