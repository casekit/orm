import { isEqual } from "es-toolkit";

import { FieldDefinition, ForeignKeyDefinition } from "@casekit/orm-schema";
import { MarkNonNullable } from "@casekit/toolbox";

import { NormalizedForeignKeyDefinition } from "#types/NormalizedForeignKeyDefinition.js";
import { PopulatedFieldDefinition } from "#types/PopulatedFieldDefinition.js";
import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";
import { getColumns } from "./getColumns.js";

export const normalizeForeignKeys = (
    models: Record<string, PopulatedModelDefinition>,
    model: PopulatedModelDefinition,
): NormalizedForeignKeyDefinition[] => {
    const columnLevelForeignKeys = Object.values(model.fields)
        .filter(hasReference)
        .map(referenceToForeignKey)
        .map((fk) => normalizeForeignKey(models, model, fk));

    const modelLevelForeignKeys = model.foreignKeys.map((fk) =>
        normalizeForeignKey(models, model, fk),
    );

    for (const fk of columnLevelForeignKeys) {
        if (
            modelLevelForeignKeys.some((other) =>
                isEqual(fk.columns, other.columns),
            )
        ) {
            throw new Error(
                `Duplicate foreign key defined in model "${model.name}"`,
            );
        }
    }

    return [...columnLevelForeignKeys, ...modelLevelForeignKeys];
};

export const normalizeForeignKey = (
    models: Record<string, PopulatedModelDefinition>,
    model: PopulatedModelDefinition,
    fk: ForeignKeyDefinition,
): NormalizedForeignKeyDefinition => {
    const referencedModel = models[fk.references.model];
    if (!referencedModel) {
        throw new Error(
            `Referenced model "${fk.references.model}" not found in models`,
        );
    }

    const columns = getColumns(model, fk.fields);

    return {
        name: fk.name ?? [model.table, ...columns, "fkey"].join("_"),
        fields: fk.fields,
        columns: columns,
        references: {
            model: fk.references.model,
            fields: fk.references.fields,
            schema: referencedModel.schema,
            table: referencedModel.table,
            columns: getColumns(referencedModel, fk.references.fields),
        },
        onUpdate: fk.onUpdate ?? null,
        onDelete: fk.onDelete ?? null,
    };
};

const referenceToForeignKey = (
    field: MarkNonNullable<PopulatedFieldDefinition, "references">,
): ForeignKeyDefinition => {
    return {
        fields: [field.name],
        references: {
            model: field.references.model,
            fields: [field.references.field],
        },
        onUpdate: field.references.onUpdate,
        onDelete: field.references.onDelete,
    };
};

const hasReference = (
    field: FieldDefinition,
): field is PopulatedFieldDefinition & {
    references: MarkNonNullable<PopulatedFieldDefinition, "references">;
} => {
    return !!field.references;
};
