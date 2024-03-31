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
                primaryKey: ["id"],
            }),
        ).toEqual(
            unindent`
            import { createModel, sql } from "@casekit/orm";

            export const myTable = createModel({
                columns: {
                    id: {
                        type: "uuid",
                        default: sql\`uuid_generate_v4()\`,
                        primaryKey: true,
                    },
                    name: { type: "text", nullable: true, unique: true },
                },
            });
        ` + "\n",
        );
    });
});
