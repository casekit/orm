import { Config, FieldDefinition } from "@casekit/orm-schema";

import { PopulatedFieldDefinition } from "#types/PopulatedFieldDefinition.js";
import { defaultZodSchema } from "./defaultZodSchema.js";

export const populateField = (
    config: Config,
    definition: FieldDefinition,
    name: string,
): PopulatedFieldDefinition => {
    return {
        name,
        column: definition.column ?? config.naming?.column?.(name) ?? name,
        type: definition.type,
        zodSchema: definition.zodSchema ?? defaultZodSchema(definition.type),
        default: definition.default ?? null,
        references: definition.references ?? null,
        nullable: definition.nullable ?? false,
        unique: definition.unique ?? false,
        provided: definition.provided ?? false,
        primaryKey: definition.primaryKey ?? false,
    };
};
