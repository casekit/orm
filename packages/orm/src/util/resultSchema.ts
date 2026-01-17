import { ZodType, z } from "zod";

import {
    NormalizedConfig,
    NormalizedModelDefinition,
    getRelation,
} from "@casekit/orm-config";
import { ModelDefinition, OperatorDefinitions } from "@casekit/orm-schema";

import { FindParams } from "../types/FindParams.js";
import { ReturningClause } from "../types/ReturningClause.js";

export const resultFields = (
    model: NormalizedModelDefinition,
    fields: string[],
): Record<string, ZodType> => {
    const obj: Record<string, ZodType> = {};

    fields.forEach((f) => {
        const field = model.fields[f]!;
        obj[f] = field.nullable
            ? field.zodSchema.nullish().default(null)
            : field.zodSchema;
    });

    return obj;
};

export const findOneResultSchema = (
    config: NormalizedConfig,
    m: string,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
): ZodType => {
    const model = config.models[m]!;

    const obj = resultFields(model, query.select);

    for (const [relationName, subquery] of Object.entries(
        query.include ?? {},
    )) {
        const relation = getRelation(model, relationName);

        const schema = findOneResultSchema(config, relation.model, subquery!);
        if (relation.type === "N:1") {
            obj[relationName] = relation.optional
                ? schema.nullish().default(null)
                : schema;
        } else {
            obj[relationName] = z.array(schema);
        }
    }
    return z.object(obj);
};

export const findManyResultSchema = (
    config: NormalizedConfig,
    m: string,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
): ZodType => {
    return z.array(findOneResultSchema(config, m, query));
};

export const returningOneResultSchema = (
    model: NormalizedModelDefinition,
    fields?: string[],
): ZodType => {
    return fields
        ? z.object(resultFields(model, fields)).nullable()
        : z.number();
};

export const returningManyResultSchema = (
    model: NormalizedModelDefinition,
    returning?: ReturningClause<ModelDefinition>,
): ZodType => {
    return returning
        ? z.array(z.object(resultFields(model, returning)))
        : z.number();
};
