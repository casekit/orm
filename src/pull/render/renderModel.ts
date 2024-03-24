import { camelCase, times } from "lodash-es";

import { ColumnMeta } from "../types/ColumnMeta";
import { UniqueConstraint } from "../types/UniqueConstraint";
import { format } from "../util/format";

const renderDefault = (d: string) => {
    return d.match(/^\d+$/) ? `${d}` : `sql\`${d}\``;
};

const renderType = (column: ColumnMeta) => {
    if (column.type === "ARRAY") {
        return (
            column.elementtype +
            times(column.cardinality)
                .map(() => "[]")
                .join("")
        );
    } else {
        return column.type;
    }
};

export const renderModel = async ({
    table,
    columns,
    uniqueConstraints,
}: {
    table: string;
    columns: ColumnMeta[];
    uniqueConstraints: UniqueConstraint[];
}) => {
    const imports = ["createModel"];
    if (columns.find((c) => c.default !== null)) {
        imports.push("sql");
    }

    return await format(`
        import { ${imports.join(", ")} } from "@casekit/orm";

        export const ${camelCase(table)} = createModel({
            columns: {
                ${columns
                    .map(
                        (c) => `
                "${camelCase(c.name)}": {
                    name: "${c.name}",
                    type: "${renderType(c)}",${c.nullable ? `\nnullable: true,\n` : ""}${c.default ? `\ndefault: ${renderDefault(c.default)},\n` : ""} }
                `,
                    )
                    .join(",\n")}
            },
            ${
                uniqueConstraints.length > 0
                    ? `
            constraints: {
                unique: [
                ${uniqueConstraints.map(
                    (constraint) => `
                    {
                        name: "${constraint.name}",
                        columns: [${constraint.columns.map((c) => `"${c}"`).join(", ")}],
                        ${constraint.where ? `where: sql\`${constraint.where}\`,` : ""}
                    }
                `,
                )}
                ]
            }
            `
                    : ""
            }
        });
    `);
};
