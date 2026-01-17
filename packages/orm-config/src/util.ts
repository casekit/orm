import { NormalizedFieldDefinition } from "./types/NormalizedFieldDefinition.js";
import { NormalizedModelDefinition } from "./types/NormalizedModelDefinition.js";
import { NormalizedRelationDefinition } from "./types/NormalizedRelationDefinition.js";

export const getModel = (
    models: Record<string, NormalizedModelDefinition>,
    name: string,
): NormalizedModelDefinition => {
    const model = models[name];
    if (!model) {
        throw new Error(`Model "${name}" not found in config`);
    }
    return model;
};

export const getRelation = (
    model: NormalizedModelDefinition,
    name: string,
): NormalizedRelationDefinition => {
    const relation = model.relations[name];
    if (!relation) {
        throw new Error(
            `Relation "${name}" not found in model "${model.name}"`,
        );
    }
    return relation;
};

export const getField = (
    model: NormalizedModelDefinition,
    name: string,
): NormalizedFieldDefinition => {
    const field = model.fields[name];
    if (!field) {
        throw new Error(`Field "${name}" not found in model "${model.name}"`);
    }
    return field;
};
