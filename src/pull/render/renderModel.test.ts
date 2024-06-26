import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { renderModel } from "./renderModel";

describe("renderModel", () => {
    test("it renders a valid model definition given introspection results", async () => {
        expect(
            await renderModel({
                table: "my_table",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        default: "uuid_generate_v4()",
                        cardinality: 0,
                        elementtype: null,
                        table: "my_table",
                        ordinal: 0,
                        nullable: false,
                    },
                    {
                        name: "name",
                        type: "text",
                        default: null,
                        cardinality: 0,
                        elementtype: null,
                        table: "my_table",
                        ordinal: 1,
                        nullable: true,
                    },
                ],
                uniqueConstraints: [
                    {
                        name: "my_table_name_unique",
                        table: "my_table",
                        definition:
                            "CREATE UNIQUE INDEX ON my_table USING btree (name)",
                        columns: ["name"],
                        where: undefined,
                    },
                ],
                foreignKeys: [],
                primaryKey: ["id"],
            }),
        ).toEqual(
            unindent`
            import { type ModelDefinition, type ModelType, sql } from "@casekit/orm";

            export const myTable = {
                table: "my_table",
                columns: {
                    id: {
                        name: "id",
                        type: "uuid",
                        primaryKey: true,
                        default: sql\`uuid_generate_v4()\`,
                    },
                    name: { name: "name", type: "text", unique: true, nullable: true },
                },
            } as const satisfies ModelDefinition;

            export type MyTable = ModelType<typeof myTable>;
        ` + "\n",
        );
    });
    test("it renders a valid model definition given introspection results with a column-local unique constraint", async () => {
        expect(
            await renderModel({
                table: "my_table",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        default: "uuid_generate_v4()",
                        cardinality: 0,
                        elementtype: null,
                        table: "my_table",
                        ordinal: 0,
                        nullable: false,
                    },
                    {
                        name: "name",
                        type: "text",
                        default: null,
                        cardinality: 0,
                        elementtype: null,
                        table: "my_table",
                        ordinal: 1,
                        nullable: true,
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        default: null,
                        cardinality: 0,
                        elementtype: null,
                        table: "my_table",
                        ordinal: 2,
                        nullable: true,
                    },
                ],
                uniqueConstraints: [
                    {
                        name: "my_table_name_unique",
                        table: "my_table",
                        definition:
                            "CREATE UNIQUE INDEX ON my_table USING btree (name)",
                        columns: ["name"],
                        where: "deleted_at IS NULL",
                    },
                ],
                primaryKey: ["id"],
                foreignKeys: [],
            }),
        ).toEqual(
            unindent`
            import { type ModelDefinition, type ModelType, sql } from "@casekit/orm";

            export const myTable = {
                table: "my_table",
                columns: {
                    id: {
                        name: "id",
                        type: "uuid",
                        primaryKey: true,
                        default: sql\`uuid_generate_v4()\`,
                    },
                    name: {
                        name: "name",
                        type: "text",
                        unique: { where: sql\`deleted_at IS NULL\` },
                        nullable: true,
                    },
                    deletedAt: { name: "deleted_at", type: "timestamp", nullable: true },
                },
            } as const satisfies ModelDefinition;

            export type MyTable = ModelType<typeof myTable>;
        ` + "\n",
        );
    });
});
