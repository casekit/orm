import { camelCase, identity, times } from "lodash-es";

import { ColumnMeta } from "../types/ColumnMeta";
import { UniqueConstraint } from "../types/UniqueConstraint";
import { format } from "../util/format";
import { quote } from "../util/quote";

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

export const renderColumn = (column: ColumnMeta) => {
    const definition = [
        `type: "${renderType(column)}"`,
        column.nullable ? "nullable: true" : null,
        column.default ? `default: ${renderDefault(column.default)}` : null,
    ]
        .filter(identity)
        .join(", ");

    return `"${column.name}": { ${definition} }`;
};

export const renderUniqueConstraint = (constraint: UniqueConstraint) => {
    return `{ columns: [${constraint.columns.map(quote).join(", ")}], ${constraint.where ? `where: sql\`${constraint.where}\`,` : ""} }`;
};

export const renderUniqueConstraints = (constraints: UniqueConstraint[]) => {
    if (constraints.length === 0) return null;
    return `unique: [ ${constraints.map(renderUniqueConstraint).join(", ")} ]`;
};

export const renderModel = async ({
    table,
    columns,
    primaryKey,
    uniqueConstraints,
}: {
    table: string;
    columns: ColumnMeta[];
    primaryKey: string[];
    uniqueConstraints: UniqueConstraint[];
}) => {
    const imports = ["createModel"];
    if (columns.find((c) => c.default !== null)) {
        imports.push("sql");
    }

    const constraints = [
        `primaryKey: [${primaryKey.map(quote).join(", ")}]`,
        renderUniqueConstraints(uniqueConstraints),
    ]
        .filter(identity)
        .join(",\n");

    return await format(`
        import { ${imports.join(", ")} } from "@casekit/orm";

        export const ${camelCase(table)} = createModel({
            columns: { ${columns.map(renderColumn).join(",\n")} },
            constraints: { ${constraints} },
        });`);
};
