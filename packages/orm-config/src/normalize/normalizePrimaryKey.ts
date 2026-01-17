import { NormalizedPrimaryKey } from "#types/NormalizedPrimaryKey.js";
import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";

export const normalizePrimaryKey = (
    model: PopulatedModelDefinition,
): NormalizedPrimaryKey[] => {
    const fieldLevelPrimaryKey = Object.entries(model.fields)
        .filter(([, field]) => field.primaryKey)
        .map(([name]) => name);

    if (model.primaryKey && fieldLevelPrimaryKey.length > 0) {
        throw new Error(
            `Model "${model.name}" has primary key fields defined at both the model and field levels.`,
        );
    }

    const fields = model.primaryKey ?? fieldLevelPrimaryKey;

    return fields.map((name) => {
        if (!model.fields[name]) {
            throw new Error(
                `Primary key field "${name}" does not exist in model "${model.name}".`,
            );
        }
        return {
            field: name,
            column: model.fields[name].column,
        };
    });
};
