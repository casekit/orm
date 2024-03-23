import { unindent } from "@casekit/unindent";

import { uniqueId } from "lodash";
import pgfmt from "pg-format";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { createModel, orm } from "../..";
import { sql } from "../../sql";
import { db } from "../../test/fixtures";
import { createTableSql } from "./createTableSql";

describe("createTableSql", () => {
    test("it generates a CREATE TABLE command", () => {
        expect(createTableSql(db.models.user).text).toEqual(unindent`
            CREATE TABLE casekit."user" (
                id uuid NOT NULL DEFAULT uuid_generate_v4(),
                username text NOT NULL UNIQUE,
                joined_at timestamp,
                PRIMARY KEY (id)
            );
        `);
    });

    test("the generated DDL successfully creates a table", async () => {
        const table = uniqueId("table-");
        const post = createModel({
            table,
            columns: {
                id: {
                    schema: z.string().uuid(),
                    type: "uuid",
                    primaryKey: true,
                    default: sql`uuid_generate_v4()`,
                },
                title: {
                    schema: z.string(),
                    type: "text",
                    default: "My first post",
                },
                content: { schema: z.string(), type: "text" },
                publishedAt: {
                    schema: z.date(),
                    type: "timestamp",
                    nullable: true,
                },
            },
        });
        orm({ models: { post } }).transact(
            async (db) => {
                await db.connection.query(createTableSql(db.models.post));

                const result = await db.connection.query(
                    pgfmt("select * from casekit.%I", table),
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
