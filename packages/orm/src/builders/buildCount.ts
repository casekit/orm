/**
 * NB. Lots of ! in this file which maybe isn't great but I think for these
 * builders, where we can be fairly confident due to the type-checking at the edges
 * that things are defined, it's better than the alternative of loads of
 * redundant checks for undefined. We've done all the checks we need at the
 * stage of normalizing the model, we can now assume everything is wired up
 * correctly.
 *
 * Also this is a file in which there's a lot of mutation and dependency
 * on the order in which things are done, which is not ideal but is what
 * it is. Refactor and/or add to/change with care.
 */
import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { makeTableAlias } from "#util/makeTableAlias.js";
import { Middleware } from "../types/Middleware.js";
import { WhereClause } from "../types/WhereClause.js";
import { buildWhere } from "./buildWhere.js";
import { CountBuilder, Table } from "./types.js";

type BaseCountParams = {
    where?: WhereClause<ModelDefinitions, OperatorDefinitions, string>;
    include?: Record<string, BaseCountParams>;
    for?: "update" | "no key update" | "share" | "key share";
};

/**
 * Builds a base CountBuilder, with only columns from the main table.
 * Joins will be added later.
 */
const buildBaseCount = (
    config: NormalizedConfig,
    middleware: Middleware[],
    m: string,
    query: BaseCountParams,
    tableIndex = 0,
): CountBuilder => {
    const model = config.models[m];
    if (!model) throw new Error(`Model "${m}" not found`);

    const table: Table = {
        schema: model.schema,
        name: model.table,
        alias: makeTableAlias(tableIndex++),
        model: m,
    };

    const where = buildWhere(config, middleware, table, query.where);

    return {
        table,
        where,
        joins: [],
        for: query.for,
        tableIndex,
    };
};

export const buildCount = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    query: BaseCountParams,
    path: string[] = [],
    tableIndex = 0,
): CountBuilder => {
    const model = config.models[modelName];
    if (!model) throw new Error(`Model "${modelName}" not found`);

    const builder = buildBaseCount(
        config,
        middleware,
        modelName,
        query,
        tableIndex,
    );

    for (const [r, subquery] of Object.entries(query.include ?? {})) {
        const relation = model.relations[r]!;
        if (relation.type !== "N:1") {
            continue;
        }

        const joinBuilder = buildCount(
            config,
            middleware,
            relation.model,
            subquery,
            [...path, r],
            builder.tableIndex,
        );

        builder.joins.push({
            path: [...path, r],
            relation: r,
            table: joinBuilder.table,
            where: joinBuilder.where,
            type: "INNER",
            columns: relation.from.columns.map((fk, i) => ({
                from: {
                    table: builder.table.alias,
                    name: fk,
                },
                to: {
                    table: joinBuilder.table.alias,
                    name: relation.to.columns[i]!,
                },
            })),
        });

        // update the parent builder's tableIndex with the one from the
        // joinBuilder, so that we don't have overlapping table indices
        builder.tableIndex = joinBuilder.tableIndex;
        builder.joins.push(...joinBuilder.joins);
    }

    return builder;
};
