import { camelCase, identity, times } from "lodash-es";

import { ColumnMeta } from "../types/ColumnMeta";
import { UniqueConstraint } from "../types/UniqueConstraint";
import { format } from "../util/format";
import { quote } from "../util/quote";

type Definition = {
    table: string;
    columns: ColumnMeta[];
    primaryKey: string[];
    uniqueConstraints: UniqueConstraint[];
};

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

export const renderColumn = (def: Definition) => (column: ColumnMeta) => {
    const uniqueConstraint = def.uniqueConstraints.find((uc) => {
        return uc.columns.length === 1 && uc.columns[0] === column.name;
    });

    const definition = [
        `type: "${renderType(column)}"`,
        column.nullable ? "nullable: true" : null,
        column.default ? `default: ${renderDefault(column.default)}` : null,
        def.primaryKey.length === 1 && def.primaryKey[0] === column.name
            ? "primaryKey: true"
            : null,
        uniqueConstraint
            ? renderColumnUniqueConstraint(uniqueConstraint)
            : null,
    ]
        .filter(identity)
        .join(", ");

    return `"${column.name}": { ${definition} }`;
};

export const renderColumnUniqueConstraint = (
    uniqueConstraint: UniqueConstraint,
) => {
    if (uniqueConstraint.nullsNotDistinct || uniqueConstraint.where) {
        return `unique: { ${uniqueConstraint.nullsNotDistinct ? "nullsNotDistinct: true," : ""} ${uniqueConstraint.where ? `where: sql\`${uniqueConstraint.where}\`` : ""}`;
    } else {
        return `unique: true`;
    }
};

export const renderUniqueConstraint = (constraint: UniqueConstraint) => {
    return `{ columns: [${constraint.columns.map(quote).join(", ")}], ${constraint.where ? `where: sql\`${constraint.where}\`,` : ""} }`;
};

export const renderUniqueConstraints = (constraints: UniqueConstraint[]) => {
    if (constraints.length === 0) return null;
    return `unique: [ ${constraints.map(renderUniqueConstraint).join(", ")} ]`;
};

export const renderModel = async (def: Definition) => {
    const imports = ["createModel"];
    if (def.columns.find((c) => c.default !== null)) {
        imports.push("sql");
    }

    const constraints = [
        def.primaryKey.length > 1
            ? `primaryKey: [${def.primaryKey.map(quote).join(", ")}]`
            : null,
        renderUniqueConstraints(
            def.uniqueConstraints.filter((c) => c.columns.length > 1),
        ),
    ]
        .filter(identity)
        .join(",\n");

    const lines: string[] = [];

    lines.push(
        `columns: { ${def.columns.map(renderColumn(def)).join(",\n")} }`,
    );

    return await format(`
        import { ${imports.join(", ")} } from "@casekit/orm";

        export const ${camelCase(def.table)} = createModel({
            ${lines.join(",\n")}
            ${constraints}
        });`);
};
