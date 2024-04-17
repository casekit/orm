import { unindent } from "@casekit/unindent";

import pg from "pg";
import { describe, expect, test } from "vitest";

import { orm, sql } from "../../";
import { ModelDefinition } from "../../schema/types/definitions/ModelDefinition";
import { createForeignKeyConstraintSql } from "./createForeignKeyConstraintSql";

describe("createForeignKeyConstraintSql", () => {
    test("it generates an ALTER TABLE command for the specified foreign key constraint", () => {
        const foo = {
            schema: "casekit",
            columns: {
                id: { type: "uuid" },
                barId: {
                    name: "bar_id",
                    type: "uuid",
                    references: { table: "bar", column: "id" },
                },
                bazId: {
                    name: "baz_id",
                    type: "uuid",
                    references: { table: "baz", column: "id" },
                },
            },
            foreignKeys: [
                {
                    columns: ["bar_id", "baz_id"],
                    references: {
                        table: "quux",
                        columns: ["bar_id", "baz_id"],
                    },
                    onUpdate: sql`CASCADE`,
                },
            ],
        } as const satisfies ModelDefinition;

        const db = orm({ models: { foo }, pool: new pg.Pool() });

        const result = db.models.foo.foreignKeys
            .map((fk) => createForeignKeyConstraintSql(db.models.foo, fk).text)
            .join("\n");

        expect(result).toEqual(unindent`
             ALTER TABLE casekit.foo ADD CONSTRAINT foo_bar_id_baz_id_fkey FOREIGN KEY (bar_id, baz_id) REFERENCES casekit.quux (bar_id, baz_id) ON UPDATE CASCADE;
             ALTER TABLE casekit.foo ADD CONSTRAINT foo_bar_id_fkey FOREIGN KEY (bar_id) REFERENCES casekit.bar (id);
             ALTER TABLE casekit.foo ADD CONSTRAINT foo_baz_id_fkey FOREIGN KEY (baz_id) REFERENCES casekit.baz (id);
        `);
    });
});
