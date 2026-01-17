import { mapValues } from "es-toolkit";

import { Config } from "@casekit/orm-schema";

import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";
import { populateField } from "./populateField.js";

export const populateModels = (
    config: Config,
): Record<string, PopulatedModelDefinition> => {
    return mapValues(config.models, (model, name) => {
        return {
            name,
            schema: model.schema ?? config.schema ?? "public",
            table: model.table ?? config.naming?.table?.(name) ?? name,
            primaryKey: model.primaryKey ?? null,
            uniqueConstraints: model.uniqueConstraints ?? [],
            foreignKeys: model.foreignKeys ?? [],
            relations: model.relations ?? {},
            fields: mapValues(model.fields, (field, name) =>
                populateField(config, field, name),
            ),
        };
    });
};
