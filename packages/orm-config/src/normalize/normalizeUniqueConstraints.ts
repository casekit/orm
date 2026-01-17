import { UniqueConstraintDefinition } from "@casekit/orm-schema";

import { NormalizedUniqueConstraintDefinition } from "#types/NormalizedUniqueConstraintDefinition.js";
import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";
import { getColumns } from "./getColumns.js";

export const normalizeUniqueConstraint = (
    model: PopulatedModelDefinition,
    constraint: UniqueConstraintDefinition,
): NormalizedUniqueConstraintDefinition => {
    const columns = getColumns(model, constraint.fields);
    return {
        name: constraint.name ?? [model.table, ...columns, "ukey"].join("_"),
        fields: constraint.fields,
        columns,
        where: constraint.where ?? null,
        nullsNotDistinct: constraint.nullsNotDistinct ?? false,
    };
};

export const normalizeUniqueConstraints = (
    model: PopulatedModelDefinition,
): NormalizedUniqueConstraintDefinition[] => {
    const columnLevelUniqueConstraints = Object.values(model.fields)
        .filter((field) => field.unique)
        .map((field) =>
            normalizeUniqueConstraint(
                model,
                typeof field.unique === "boolean"
                    ? {
                          fields: [field.name],
                          where: null,
                          nullsNotDistinct: false,
                      }
                    : { fields: [field.name], ...field.unique },
            ),
        );

    const modelLevelUniqueConstraints = model.uniqueConstraints.map(
        (constraint) => normalizeUniqueConstraint(model, constraint),
    );

    for (const constraint of columnLevelUniqueConstraints) {
        if (
            modelLevelUniqueConstraints.some((other) =>
                constraint.fields.every((field) =>
                    other.fields.includes(field),
                ),
            )
        ) {
            throw new Error(
                `Duplicate unique constraint defined in model "${model.name}"`,
            );
        }
    }

    return [...columnLevelUniqueConstraints, ...modelLevelUniqueConstraints];
};
