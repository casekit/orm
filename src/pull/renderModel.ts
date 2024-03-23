import { camelCase } from "lodash";

import { format } from "./format";
import { ColumnMeta } from "./types/ColumnMeta";

const renderDefault = (d: string) => {
    return d.match(/^\d+$/) ? `${d}` : `sql\`${d}\``;
};

export const renderModel = async (table: string, columns: ColumnMeta[]) => {
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
                    type: "${c.type}",${c.nullable ? `\nnullable: true,\n` : ""}${c.default ? `\ndefault: ${renderDefault(c.default)},\n` : ""}
                }
                `,
                    )
                    .join(",\n")}
            }
        });
    `);
};
