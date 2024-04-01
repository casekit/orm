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
          : ["true", "false"].includes(d)
            ? d
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

export const renderColumn = (def: Definition) => (column: ColumnMeta) => {
    const primaryKey =
        def.primaryKey.length === 1 && def.primaryKey[0] === column.name;

    const unique = def.uniqueConstraints.find(
        (uc) => uc.columns.length === 1 && uc.columns[0] === column.name,
    );

    const references = def.foreignKeys.find(
        (fk) =>
            fk.columnsFrom.length === 1 && fk.columnsFrom[0] === column.name,
    );

    const definition = [
        `name: "${column.name}"`,
        `type: "${renderType(column)}"`,
        primaryKey ? "primaryKey: true" : null,
        unique ? `unique: ${renderColumnUniqueConstraint(unique)}` : null,
        column.nullable ? "nullable: true" : null,
        column.default ? `default: ${renderDefault(column.default)}` : null,
        references
            ? `references: { table: ${quote(references.tableTo)}, column: ${quote(references.columnsTo[0])} }`
            : null,
    ]
        .filter(identity)
        .join(", ");

    return `"${camelCase(column.name)}": { ${definition} }`;
};

export const renderColumnUniqueConstraint = (constraint: UniqueConstraint) => {
    if (constraint.nullsNotDistinct || constraint.where) {
        return `{${constraint.nullsNotDistinct ? " nullsNotDistinct: true," : ""}${constraint.where ? ` where: sql\`${constraint.where}\`}` : ""}`;
    } else {
        return "true";
    }
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
    const imports = ["type ModelDefinition"];
    if (def.columns.find((c) => c.default !== null)) {
        imports.push("sql");
    }

    const lines: string[] = [];

    lines.push(
        `columns: { ${def.columns.map(renderColumn(def)).join(",\n")} }`,
    );

    if (def.primaryKey.length > 1) {
        lines.push(`primaryKey: [${def.primaryKey.map(quote).join(", ")}]`);
    }

    const multiColumnUniqueConstraints = def.uniqueConstraints.filter(
        (uc) => uc.columns.length > 1,
    );

    if (multiColumnUniqueConstraints.length > 0) {
        lines.push(renderUniqueConstraints(multiColumnUniqueConstraints));
    }

    const multiColumnForeignKeys = def.foreignKeys.filter(
        (fk) => fk.columnsFrom.length > 1,
    );

    if (multiColumnForeignKeys.length > 0) {
        lines.push(renderForeignKeys(multiColumnForeignKeys));
    }

    return await format(`
        import { ${imports.join(", ")} } from "@casekit/orm";

        export const ${camelCase(def.table)} = {
            ${lines.join(",\n")}
        } satisfies ModelDefinition;`);
};
