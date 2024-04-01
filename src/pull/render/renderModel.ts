import { camelCase, identity, times } from "lodash-es";

import { ColumnMeta } from "../types/ColumnMeta";
import { ForeignKey } from "../types/ForeignKey";
import { UniqueConstraint } from "../types/UniqueConstraint";
import { format } from "../util/format";
import { quote } from "../util/quote";

type Definition = {
    table: string;
    columns: ColumnMeta[];
    primaryKey: string[];
    uniqueConstraints: UniqueConstraint[];
    foreignKeys: ForeignKey[];
};

const renderDefault = (d: string) => {
    return d.match(/^\d+$/)
        ? `${d}`
        : d.match(/::text$/)
          ? d.replace(/::text$/, "")
          : `sql\`${d}\``;
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

export const renderColumn = (column: ColumnMeta) => {
    const definition = [
        `name: "${column.name}"`,
        `type: "${renderType(column)}"`,
        column.nullable ? "nullable: true" : null,
        column.default ? `default: ${renderDefault(column.default)}` : null,
    ]
        .filter(identity)
        .join(", ");

    return `"${camelCase(column.name)}": { ${definition} }`;
};

export const renderUniqueConstraint = (constraint: UniqueConstraint) => {
    return `{ columns: [${constraint.columns.map(quote).join(", ")}], ${constraint.where ? `where: sql\`${constraint.where}\`,` : ""} }`;
};

export const renderUniqueConstraints = (constraints: UniqueConstraint[]) => {
    return `uniqueConstraints: [ ${constraints.map(renderUniqueConstraint).join(", ")} ]`;
};

export const renderForeignKey = (constraint: ForeignKey) => {
    return `{
        columns: [${constraint.columnsFrom.map(quote).join(", ")}],
        references: {
             table: ${quote(constraint.tableTo)},
             columns: [${constraint.columnsTo.map(quote).join(", ")}]
        }
    }`;
};

export const renderForeignKeys = (constraints: ForeignKey[]) => {
    return `foreignKeys: [ ${constraints.map(renderForeignKey).join(", ")} ]`;
};

export const renderModel = async (def: Definition) => {
    const imports = ["createModel"];
    if (def.columns.find((c) => c.default !== null)) {
        imports.push("sql");
    }

    const lines: string[] = [];

    lines.push(`columns: { ${def.columns.map(renderColumn).join(",\n")} }`);

    if (def.primaryKey.length > 0) {
        lines.push(`primaryKey: [${def.primaryKey.map(quote).join(", ")}]`);
    }

    if (def.uniqueConstraints.length > 0) {
        lines.push(renderUniqueConstraints(def.uniqueConstraints));
    }

    if (def.foreignKeys.length > 0) {
        lines.push(renderForeignKeys(def.foreignKeys));
    }

    return await format(`
        import { ${imports.join(", ")} } from "@casekit/orm";

        export const ${camelCase(def.table)} = createModel({
            ${lines.join(",\n")}
        });`);
};
