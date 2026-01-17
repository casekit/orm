import { mapValues } from "es-toolkit";
import { castArray } from "es-toolkit/compat";

import {
    NormalizedManyToManyRelationDefinition,
    NormalizedManyToOneRelationDefinition,
    NormalizedOneToManyRelationDefinition,
    NormalizedRelationDefinition,
} from "#types/NormalizedRelationDefinition.js";
import { PopulatedModelDefinition } from "#types/PopulatedModelDefinition.js";

const normalizeRelationKeys = (
    model: PopulatedModelDefinition,
    fields: string | string[],
) => {
    const columns = castArray(fields).map((field) => {
        if (!model.fields[field]) {
            throw new Error(
                `Model "${model.name}" has relation with non-existent field "${field}".`,
            );
        }
        return model.fields[field].column;
    });
    return { fields: castArray(fields), columns };
};

export const normalizeRelations = (
    models: Record<string, PopulatedModelDefinition>,
    model: PopulatedModelDefinition,
): Record<string, NormalizedRelationDefinition> => {
    return mapValues(model.relations, (relation, name) => {
        const relatedModel = models[relation.model];
        if (!relatedModel) {
            throw new Error(
                `Model "${model.name}" has relation "${name}" that references non-existent model "${relation.model}".`,
            );
        }

        if (relation.type === "N:N") {
            const joinModel = models[relation.through.model];
            if (!joinModel) {
                throw new Error(
                    `Model "${model.name}" has relation "${name}" with join model "${relation.through.model}" that does not exist.`,
                );
            }

            return {
                name,
                type: relation.type,
                model: relation.model,
                table: relatedModel.table,
                through: {
                    model: joinModel.name,
                    table: joinModel.table,
                    fromRelation: relation.through.fromRelation,
                    toRelation: relation.through.toRelation,
                },
            } satisfies NormalizedManyToManyRelationDefinition;
        } else if (relation.type === "1:N") {
            return {
                name,
                type: relation.type,
                model: relation.model,
                table: relatedModel.table,
                from: normalizeRelationKeys(model, relation.fromField),
                to: normalizeRelationKeys(relatedModel, relation.toField),
            } satisfies NormalizedOneToManyRelationDefinition;
        } else {
            return {
                name,
                type: relation.type,
                model: relation.model,
                table: relatedModel.table,
                optional: relation.optional ?? false,
                from: normalizeRelationKeys(model, relation.fromField),
                to: normalizeRelationKeys(relatedModel, relation.toField),
            } satisfies NormalizedManyToOneRelationDefinition;
        }
    });
};
