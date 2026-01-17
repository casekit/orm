import { identity } from "es-toolkit";

import { NormalizedConfig, getModel, getRelation } from "@casekit/orm-config";
import { ModelDefinition, OperatorDefinitions } from "@casekit/orm-schema";

import { FindParams } from "../types/FindParams.js";
import { SelectClause } from "../types/SelectClause.js";

export type ToManyRelationSubquery = {
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >;
    modelName: string;
    from: string[];
    to: string[];
    path: string[];
    extract: (rows: Record<string, unknown>[]) => unknown[];
};

export const getIncludedToManySubqueries = (
    config: NormalizedConfig,
    modelName: string,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
    path: string[] = [],
): ToManyRelationSubquery[] => {
    const relationQueries: ToManyRelationSubquery[] = [];
    for (const [relationName, subquery] of Object.entries(
        query.include ?? {},
    )) {
        const model = getModel(config.models, modelName);
        const relation = getRelation(model, relationName);

        if (relation.type === "1:N") {
            relationQueries.push({
                modelName: relation.model,
                query: subquery!,
                from: relation.from.fields,
                to: relation.to.fields,
                extract: identity,
                path: [...path, relation.name],
            });
        } else if (relation.type === "N:N") {
            // for N:N relations, we create a lateral join from the parent model
            // to the join model via its 'fromRelation', rather than directly tothe relation
            // model itself.
            const throughModel = getModel(
                config.models,
                relation.through.model,
            );

            const fromRelation = getRelation(
                throughModel,
                relation.through.fromRelation,
            );

            if (fromRelation.type !== "N:1") {
                throw new Error(
                    `Expected relation ${relation.through.fromRelation} to be a N:1 relation, but got ${fromRelation.type}`,
                );
            }

            const toRelation = getRelation(
                throughModel,
                relation.through.toRelation,
            );

            if (toRelation.type !== "N:1") {
                throw new Error(
                    `Expected relation ${relation.through.toRelation} to be a N:1 relation, but got ${toRelation.type}`,
                );
            }

            const from = fromRelation.to.fields;
            const to = fromRelation.from.fields;

            // instead of querying directly for the relation model,
            // we wrap the query in a query of the join model and
            // include the query of the relation model as a 1:N
            // subquery
            const query: FindParams<
                Record<string, Required<ModelDefinition>>,
                OperatorDefinitions,
                string
            > = {
                select: throughModel.primaryKey.map(
                    (k) => k.field,
                ) as SelectClause<ModelDefinition>,
                include: {
                    [toRelation.name]: subquery,
                },
            };

            // because we're going to be running a query on the join model
            // rather than directly on the relation model, the results
            // will be for the join model, so we need to map over them
            // and extract the embedded relation model results.
            const extract = (rows: Record<string, unknown>[]) =>
                rows.map((r) => r[toRelation.name]);

            relationQueries.push({
                modelName: relation.through.model,
                query,
                path: [...path, relation.name],
                from,
                to,
                extract,
            });
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        } else if (relation.type === "N:1") {
            relationQueries.push(
                ...getIncludedToManySubqueries(
                    config,
                    relation.model,
                    subquery!,
                    [...path, relation.name],
                ),
            );
        }
    }
    return relationQueries;
};
