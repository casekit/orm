import { NormalizedConfig } from "@casekit/orm-config";
import { SQLStatement } from "@casekit/sql";

import { arrayToSqlArray } from "#push/arrayToSqlArray.js";
import type {
    ColumnSnapshot,
    ForeignKeySnapshot,
    SchemaSnapshot,
    TableSnapshot,
    UniqueConstraintSnapshot,
} from "./types.js";

/**
 * Serialise a field default value to a string that can be compared
 * with the normalised default values returned by pullDefault().
 */
const serialiseDefault = (value: unknown): string | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (value instanceof SQLStatement) {
        return value.text;
    }

    if (typeof value === "string") {
        return `'${value}'`;
    }

    if (typeof value === "number" || typeof value === "bigint") {
        return String(value);
    }

    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    if (Array.isArray(value)) {
        return `'${arrayToSqlArray(value)}'`;
    }

    // Objects (JSON)
    return `'${JSON.stringify(value)}'`;
};

/**
 * Convert a NormalizedConfig (the desired TypeScript schema state)
 * into a SchemaSnapshot for diffing against the database state.
 */
export const configToSnapshot = (config: NormalizedConfig): SchemaSnapshot => {
    const models = Object.values(config.models);

    const schemas = [...new Set(models.map((m) => m.schema))].sort();

    const extensions = config.extensions.flatMap((ext) =>
        schemas.map((schema) => ({ name: ext, schema })),
    );

    const tables: TableSnapshot[] = models.map((model) => {
        const fields = Object.values(model.fields);

        const columns: ColumnSnapshot[] = fields.map((field) => ({
            name: field.column,
            type: field.type,
            nullable: field.nullable,
            default: serialiseDefault(field.default),
        }));

        const pkColumns = model.primaryKey.map((pk) => pk.column);
        const primaryKey = {
            name: pkColumns.length > 0 ? `${model.table}_pkey` : null,
            columns: pkColumns,
        };

        const foreignKeys: ForeignKeySnapshot[] = model.foreignKeys.map(
            (fk) => ({
                name: fk.name,
                columns: fk.columns,
                referencesSchema: fk.references.schema,
                referencesTable: fk.references.table,
                referencesColumns: fk.references.columns,
                onDelete: fk.onDelete ?? null,
                onUpdate: fk.onUpdate ?? null,
            }),
        );

        const uniqueConstraints: UniqueConstraintSnapshot[] =
            model.uniqueConstraints.map((uc) => ({
                name: uc.name,
                columns: uc.columns,
                nullsNotDistinct: uc.nullsNotDistinct ?? false,
                where: uc.where ? uc.where.text : null,
            }));

        return {
            schema: model.schema,
            name: model.table,
            columns,
            primaryKey,
            foreignKeys,
            uniqueConstraints,
        };
    });

    return { schemas, extensions, tables };
};
