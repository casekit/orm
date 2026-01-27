import { camelCase } from "es-toolkit/string";

import type { Column, Table } from "@casekit/orm-migrate";

import { renderDefaultValue } from "./renderDefault.js";
import { renderType } from "./renderType.js";

export const renderFieldDefinition = (column: Column, table: Table): string => {
    const parts: string[] = [];

    // Column name if different from field name
    const fieldName = camelCase(column.column);
    if (fieldName !== column.column) {
        parts.push(`column: "${column.column}"`);
    }

    // Type
    parts.push(`type: "${renderType(column)}"`);

    // Primary key (single column)
    const isPrimaryKey =
        table.primaryKey?.columns.length === 1 &&
        table.primaryKey?.columns[0] === column.column;
    if (isPrimaryKey) {
        parts.push("primaryKey: true");
    }

    // Unique constraint (single column)
    const uniqueConstraint = table.uniqueConstraints.find(
        (uc) =>
            uc.definition.includes(`(${column.column})`) ||
            uc.definition.includes(`("${column.column}")`),
    );

    if (uniqueConstraint) {
        const hasNullsNotDistinct =
            uniqueConstraint.definition.includes("NULLS NOT DISTINCT");
        if (hasNullsNotDistinct) {
            parts.push("unique: { nullsNotDistinct: true }");
        } else {
            parts.push("unique: true");
        }
    }

    // Nullable
    if (column.nullable) {
        parts.push("nullable: true");
    }

    // Default (skip for SERIAL columns as they handle their own default)
    if (column.default && !column.isSerial) {
        const defaultValue = renderDefaultValue(column.type, column.default);
        if (defaultValue !== null) {
            parts.push(`default: ${defaultValue}`);
        }
    }

    // Foreign key reference (single column)
    const foreignKey = table.foreignKeys.find(
        (fk) =>
            fk.columnsFrom.length === 1 && fk.columnsFrom[0] === column.column,
    );
    if (foreignKey) {
        const toField = foreignKey.columnsTo[0]!;
        parts.push(
            `references: { model: "${camelCase(foreignKey.tableTo)}", field: "${camelCase(toField)}" }`,
        );
    }

    return `{ ${parts.join(", ")} }`;
};
