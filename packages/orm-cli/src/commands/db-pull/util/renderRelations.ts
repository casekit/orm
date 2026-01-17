import { camelCase } from "es-toolkit/string";

import type { ForeignKey, Table } from "@casekit/orm-migrate";

import {
    guessManyToOneRelationName,
    guessOneToManyRelationName,
} from "./relationNames.js";

export const renderRelations = (
    table: Table,
    allForeignKeys: ForeignKey[],
): string => {
    const relations: string[] = [];

    // N:1 relations (this table references others)
    table.foreignKeys.forEach((fk) => {
        const relationName = guessManyToOneRelationName(fk);
        const parts = [`type: "N:1"`, `model: "${camelCase(fk.tableTo)}"`];

        if (
            fk.columnsFrom.length === 1 &&
            fk.columnsTo.length === 1 &&
            fk.columnsFrom[0] &&
            fk.columnsTo[0]
        ) {
            const fromField = camelCase(fk.columnsFrom[0]);
            const toField = camelCase(fk.columnsTo[0]);
            parts.push(`fromField: "${fromField}"`);
            parts.push(`toField: "${toField}"`);
        } else {
            parts.push(
                `fromField: [${fk.columnsFrom.map((f: string) => `"${camelCase(f)}"`).join(", ")}]`,
            );
            parts.push(
                `toField: [${fk.columnsTo.map((f: string) => `"${camelCase(f)}"`).join(", ")}]`,
            );
        }

        // Check if the foreign key column is nullable
        const isNullable =
            fk.columnsFrom.length === 1 &&
            table.columns.find((c) => c.column === fk.columnsFrom[0])?.nullable;
        if (isNullable) {
            parts.push("optional: true");
        }

        relations.push(`${relationName}: { ${parts.join(", ")} }`);
    });

    // 1:N relations (other tables reference this one)
    allForeignKeys
        .filter((fk) => fk.tableTo === table.name && fk.schema === table.schema)
        .forEach((fk) => {
            const relationName = guessOneToManyRelationName(fk);
            const parts = [
                `type: "1:N"`,
                `model: "${camelCase(fk.tableFrom)}"`,
            ];

            if (
                fk.columnsFrom.length === 1 &&
                fk.columnsTo.length === 1 &&
                fk.columnsFrom[0] &&
                fk.columnsTo[0]
            ) {
                const fromField = camelCase(fk.columnsTo[0]);
                const toField = camelCase(fk.columnsFrom[0]);
                parts.push(`fromField: "${fromField}"`);
                parts.push(`toField: "${toField}"`);
            } else {
                parts.push(
                    `fromField: [${fk.columnsTo.map((f: string) => `"${camelCase(f)}"`).join(", ")}]`,
                );
                parts.push(
                    `toField: [${fk.columnsFrom.map((f: string) => `"${camelCase(f)}"`).join(", ")}]`,
                );
            }

            relations.push(`${relationName}: { ${parts.join(", ")} }`);
        });

    return relations.length > 0 ? relations.join(",\n        ") : "";
};
