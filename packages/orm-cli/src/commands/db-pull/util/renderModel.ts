import { camelCase } from "es-toolkit/string";

import type { Table } from "@casekit/orm-migrate";

import { prettify } from "#util/prettify.js";
import { renderFieldDefinition } from "./renderFieldDefinition.js";
import { renderRelations } from "./renderRelations.js";

export const renderModel = async (
    table: Table,
    allTables: Table[],
): Promise<string> => {
    // Render fields
    const fields = table.columns
        .map((column) => {
            const fieldName = camelCase(column.column);
            const definition = renderFieldDefinition(column, table);
            return `        ${fieldName}: ${definition}`;
        })
        .join(",\n");

    // Render multi-column primary key
    let primaryKeyDef = "";
    if (table.primaryKey && table.primaryKey.columns.length > 1) {
        const pkColumns = table.primaryKey.columns.map(
            (col) => `"${camelCase(col)}"`,
        );
        primaryKeyDef = `\n    primaryKey: [${pkColumns.join(", ")}],`;
    }

    // Render multi-column unique constraints
    let uniqueConstraintsDef = "";
    const multiColumnUniqueConstraints = table.uniqueConstraints.filter(
        (uc) => {
            // Parse columns from definition - this is a bit hacky but matches legacy
            const match = /\(([^)]+)\)/.exec(uc.definition);
            if (!match?.[1]) return false;
            const columns = match[1].split(",").map((c) => c.trim());
            return columns.length > 1;
        },
    );

    if (multiColumnUniqueConstraints.length > 0) {
        const constraints = multiColumnUniqueConstraints.map((uc) => {
            const match = /\(([^)]+)\)/.exec(uc.definition);
            const columns = match?.[1]
                ? match[1].split(",").map((c: string) => c.trim())
                : [];
            const fields = columns
                .map((c: string) => `"${camelCase(c)}"`)
                .join(", ");
            const hasNullsNotDistinct =
                uc.definition.includes("NULLS NOT DISTINCT");

            if (hasNullsNotDistinct) {
                return `{ fields: [${fields}], nullsNotDistinct: true }`;
            }
            return `{ fields: [${fields}] }`;
        });

        uniqueConstraintsDef = `\n    uniqueConstraints: [\n        ${constraints.join(",\n        ")}\n    ],`;
    }

    // Render multi-column foreign keys
    let foreignKeysDef = "";
    const multiColumnForeignKeys = table.foreignKeys.filter(
        (fk) => fk.columnsFrom.length > 1,
    );

    if (multiColumnForeignKeys.length > 0) {
        const constraints = multiColumnForeignKeys.map((fk) => {
            const fields = fk.columnsFrom
                .map((f: string) => `"${camelCase(f)}"`)
                .join(", ");
            const toFields = fk.columnsTo
                .map((f: string) => `"${camelCase(f)}"`)
                .join(", ");

            return `{\n            fields: [${fields}],\n            references: {\n                model: "${camelCase(fk.tableTo)}",\n                fields: [${toFields}]\n            }\n        }`;
        });

        foreignKeysDef = `\n    foreignKeys: [\n        ${constraints.join(",\n        ")}\n    ],`;
    }

    // Render relations
    const allForeignKeys = allTables.flatMap((t) => t.foreignKeys);
    const relations = renderRelations(table, allForeignKeys);
    const relationsDef = relations
        ? `\n    relations: {\n        ${relations}\n    },`
        : "";

    // Build the final model
    const modelName = camelCase(table.name);
    const tableDef =
        modelName !== table.name ? `\n    table: "${table.name}",` : "";
    const schemaDef =
        table.schema !== "public" ? `\n    schema: "${table.schema}",` : "";

    const hasAdditionalSections =
        primaryKeyDef || uniqueConstraintsDef || foreignKeysDef || relationsDef;

    const codeWithoutImports = `
export const ${modelName} = {${schemaDef}${tableDef}
    fields: {
${fields},
    }${hasAdditionalSections ? "," : ""}${primaryKeyDef}${uniqueConstraintsDef}${foreignKeysDef}${relationsDef}
} as const satisfies ModelDefinition;
`;

    const needsSql = codeWithoutImports.includes("sql`");

    const imports = ["type ModelDefinition"];
    if (needsSql) {
        imports.push("sql");
    }

    const code =
        `import { ${imports.join(", ")} } from "@casekit/orm";\n` +
        codeWithoutImports;

    return await prettify(process.cwd(), code);
};
