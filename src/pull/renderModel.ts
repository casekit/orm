import { unindent } from "@casekit/unindent";

import { camelCase } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderModel = (tablename: string, columns: any[]) => {
    const imports = ["createModel"];
    if (columns.find((c) => c.default !== null)) {
        imports.push("sql");
    }

    const model = {
        name: camelCase(tablename),
        columns: columns.map((c) => ({
            field: camelCase(c.column_name),
            name: c.column_name,
            default: c.column_default,
            nullable: c.is_nullable,
            type: c.data_type,
            elementType: c.element_data_type,
        })),
    };

    return unindent`
        import { ${imports.join(", ")} } from "@casekit/orm";

        export const ${model.name} = createModel({
            columns: {
                ${model.columns.map(
                    (c) => unindent`
                "${c.field}": {
                    name: ${c.name},
                    type: ${c.type},${c.nullable ? `\nnullable: true,\n` : ""}${c.default ? `\ndefault: sql\`${c.default}\`,\n` : ""}
                },
                `,
                )}
            }
        });
    `;
};
