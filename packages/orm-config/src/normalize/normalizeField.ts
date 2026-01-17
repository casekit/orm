import { NormalizedFieldDefinition } from "#types/NormalizedFieldDefinition.js";
import { PopulatedFieldDefinition } from "#types/PopulatedFieldDefinition.js";

export const normalizeField = (
    field: PopulatedFieldDefinition,
): NormalizedFieldDefinition => {
    return {
        name: field.name,
        column: field.column,
        type: field.type,
        zodSchema: field.zodSchema,
        nullable: field.nullable,
        default: field.default,
        provided: field.provided,
    };
};
