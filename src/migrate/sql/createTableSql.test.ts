import { unindent } from "@casekit/unindent";

import { snakeCase, uniqueId } from "lodash-es";
import pg from "pg";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { orm } from "../..";
import { ModelDefinition } from "../../schema/types/definitions/ModelDefinition";
import { sql } from "../../sql";
import { db } from "../../test/db";
import { createTableSql } from "./createTableSql";

describe("createTableSql", () => {
    test("it generates a CREATE TABLE command", () => {
        expect(createTableSql(db.models.user).text).toEqual(unindent`
            CREATE TABLE casekit."user" (
                id uuid NOT NULL DEFAULT uuid_generate_v4(),
                username text NOT NULL,
                created_at timestamp,
                updated_at timestamp,
                deleted_at timestamp,
                PRIMARY KEY (id)
            );
        `);
    });

    test("the generated DDL successfully creates a table", async () => {
        const table = uniqueId("table-");
        const post = {
            table,
            columns: {
                id: {
                    zodSchema: z.string().uuid(),
                    type: "uuid",
                    default: sql`uuid_generate_v4()`,
                },
                title: {
                    zodSchema: z.string(),
                    type: "text",
                    default: "My first post",
                },
                content: { zodSchema: z.string(), type: "text" },
                publishedAt: {
                    zodSchema: z.date(),
                    type: "timestamp",
                    nullable: true,
                },
            },
        } satisfies ModelDefinition;
        await orm({
            models: { post },
            relations: { post: {} },
            naming: { column: snakeCase },
            pool: new pg.Pool(),
        }).transact(
            async (db) => {
                await db.connection.query(createTableSql(db.models.post));

                const result = await db.connection.query(
                    sql`select * from public.%I`.withIdentifiers(table),
                );

                expect(result.fields.map((f) => f.name)).toEqual([
                    "id",
                    "title",
                    "content",
                    "published_at",
                ]);
            },
            { rollback: true },
        );
    });
});
