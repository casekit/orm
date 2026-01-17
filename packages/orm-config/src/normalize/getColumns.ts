import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";

export const getColumns = (
    model: PopulatedModelDefinition,
    fields: string[],
): string[] => {
    return fields.map((f) => {
        if (!model.fields[f]) {
            throw new Error(`Field "${f}" not found in model "${model.name}"`);
        }
        return model.fields[f].column;
    });
};
