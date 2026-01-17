import { mapValues } from "es-toolkit";

import { NormalizedModelDefinition } from "#types/NormalizedModelDefinition.js";
import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";
import { normalizeField } from "./normalizeField.js";
import { normalizeForeignKeys } from "./normalizeForeignKeys.js";
import { normalizePrimaryKey } from "./normalizePrimaryKey.js";
import { normalizeRelations } from "./normalizeRelations.js";
import { normalizeUniqueConstraints } from "./normalizeUniqueConstraints.js";

export const normalizeModel = (
    models: Record<string, PopulatedModelDefinition>,
    model: PopulatedModelDefinition,
): NormalizedModelDefinition => {
    return {
        name: model.name,
        schema: model.schema,
        table: model.table,
        fields: mapValues(model.fields, (field) => normalizeField(field)),
        primaryKey: normalizePrimaryKey(model),
        uniqueConstraints: normalizeUniqueConstraints(model),
        foreignKeys: normalizeForeignKeys(models, model),
        relations: normalizeRelations(models, model),
    };
};
