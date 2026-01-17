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
import { pickBy, uniq } from "es-toolkit";
import { max, min } from "es-toolkit/compat";

import {
    NormalizedConfig,
    NormalizedModelDefinition,
    getField,
} from "@casekit/orm-config";
import {
    ModelDefinition,
    ModelDefinitions,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { FindParams } from "#types/FindParams.js";
import { makeTableAlias } from "#util/makeTableAlias.js";
import { Middleware } from "../types/Middleware.js";
import { buildWhere } from "./buildWhere.js";
import { FindBuilder, OrderBy, SelectedColumn, Table } from "./types.js";

/**
 * Builds a base FindBuilder, with only columns from the main table.
 * Joins will be added later.
 */
const buildBaseFind = (
    config: NormalizedConfig,
    middleware: Middleware[],
    m: string,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
    lateralBy: { field: string; values: unknown[] }[] = [],
    path: string[] = [],
    tableIndex = 0,
): FindBuilder => {
    const model = config.models[m];
    if (!model) throw new Error(`Model "${m}" not found`);

    let colIndex = 0;

    const table: Table = {
        schema: model.schema,
        name: model.table,
        alias: makeTableAlias(tableIndex++),
        model: m,
    };

    const columns: SelectedColumn[] = uniq([
        ...query.select,
        // we always select the primary key even if it's not explicitly
        // requested so we can use it for wiring up relationships
        ...model.primaryKey.map((pk) => pk.field),
        // we also select any foreign keys we're doing a lateral join on
        ...lateralBy.map((l) => l.field),
    ]).map((f) => {
        const field = getField(model, f);
        return {
            table: table.alias,
            name: field.column,
            alias: `${table.alias}_${colIndex++}`,
            path: [...path, f],
        };
    });

    const where = buildWhere(config, middleware, table, query.where);

    return {
        table,
        columns,
        where,
        joins: [],
        for: query.for,
        orderBy: [],
        offset: query.offset,
        limit: query.limit,
        tableIndex,
    };
};

const collectManyToOneQueries = (
    model: NormalizedModelDefinition,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
): Record<
    string,
    FindParams<ModelDefinitions, OperatorDefinitions, string>
> => {
    // this slightly complex chain gets all the N:1 relations
    // we're querying.  as well as the contents of the include
    // key, we make sure to include a join to any relations
    // we're ordering by (we'll use them later).
    // relations we're ordering by are identified by being a
    // model name and field name separated by a dot.
    // this is a tiny bit brittle in the case where people
    // create a model or field name that contains a dot,
    // but that would be a v weird thing to do as they are
    // both javascript identifiers so would be a real pain
    // to write in code. so i think it's probably fine to
    // not support it.
    return pickBy(
        {
            ...query.include,
            ...query.orderBy
                // deal with the fact that an order by column
                //can be a single value or an array with a direction
                ?.map((ob) => (typeof ob === "string" ? ob : ob[0]))
                // get only the order by columns that are on relation tables
                .filter((ob) => ob.includes("."))
                // get the relation model name
                .map((ob) => ob.split(".")[0]!)
                // check it's not already something we're joining to
                .filter((f) => !(f in (query.include ?? {})))
                // if not, add a query to it with an empty select
                // (ok because we always select the primary key)
                .reduce((acc, f) => ({ ...acc, [f]: { select: [] } }), {}),
        },
        // finally select only N:1 relations as these
        // are the only kind we join to directly
        (_query, relation) => model.relations[relation]!.type === "N:1",
    );
};

const buildOrderBy = (
    config: NormalizedConfig,
    model: NormalizedModelDefinition,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
    builder: FindBuilder,
): OrderBy[] => {
    return (
        query.orderBy?.map((ob) => {
            const field = typeof ob === "string" ? ob : ob[0];
            const direction = typeof ob === "string" ? "ASC" : ob[1];
            if (field.includes(".")) {
                const [relation, relationField] = field.split(".");
                const join = builder.joins.find((j) => j.relation === relation);
                const joinedModel =
                    config.models[model.relations[join!.relation]!.model];
                return {
                    column: {
                        table: join!.table.alias,
                        name: joinedModel!.fields[relationField!]!.column,
                    },
                    direction:
                        direction.toUpperCase() === "DESC" ? "DESC" : "ASC",
                };
            } else {
                return {
                    column: {
                        table: builder.table.alias,
                        name: getField(model, field).column,
                    },
                    direction:
                        direction.toUpperCase() === "DESC" ? "DESC" : "ASC",
                };
            }
        }) ?? []
    );
};

export const buildFind = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
    lateralBy: { field: string; values: unknown[] }[] = [],
    path: string[] = [],
    tableIndex = 0,
): FindBuilder => {
    const model = config.models[modelName];
    if (!model) throw new Error(`Model "${modelName}" not found`);

    const builder = buildBaseFind(
        config,
        middleware,
        modelName,
        query,
        lateralBy,
        path,
        tableIndex,
    );

    const manyToOneQueries = collectManyToOneQueries(model, query);

    for (const [r, subquery] of Object.entries(manyToOneQueries)) {
        const relation = model.relations[r]!;
        if (relation.type !== "N:1") {
            throw new Error(
                `Unexpected relation type: ${relation.type}. Should be N:1`,
            );
        }

        const joinBuilder = buildFind(
            config,
            middleware,
            relation.model,
            subquery,
            [],
            [...path, r],
            builder.tableIndex,
        );

        const joinType =
            relation.optional && !subquery.where ? "LEFT" : "INNER";
        const needsSubquery =
            joinType === "LEFT" && joinBuilder.joins.length > 0;

        if (needsSubquery) {
            // When we have a LEFT JOIN with nested joins, we need to wrap
            // everything in a subquery to preserve LEFT JOIN semantics.
            // Otherwise, INNER JOINs in the nested relations would filter
            // out rows where the optional relation is NULL.

            const subqueryAlias = `${joinBuilder.table.alias}_subq`;

            // The join columns need to reference the subquery output columns
            // by their aliases rather than the original table
            const joinColumns = relation.from.columns.map((fk, i) => {
                const toColumnName = relation.to.columns[i]!;
                // Find the column in the subquery that matches the join key
                const toColumn = joinBuilder.columns.find(
                    (col) =>
                        col.table === joinBuilder.table.alias &&
                        col.name === toColumnName,
                );
                if (!toColumn) {
                    throw new Error(
                        `Join key column ${toColumnName} not found in select for relation ${r}`,
                    );
                }
                return {
                    from: {
                        table: builder.table.alias,
                        name: fk,
                    },
                    to: {
                        table: subqueryAlias,
                        name: toColumn.alias, // Use the column alias from subquery
                    },
                };
            });

            builder.joins.push({
                relation: r,
                path: [...path, r],
                type: joinType,
                table: joinBuilder.table,
                where: joinBuilder.where,
                orderBy: joinBuilder.orderBy,
                columns: joinColumns,
                subquery: {
                    alias: subqueryAlias,
                    joins: joinBuilder.joins,
                    columns: joinBuilder.columns,
                },
            });

            // Add columns but update their table reference to the subquery alias
            // and use the column's alias as the name since that's what the subquery outputs
            builder.columns.push(
                ...joinBuilder.columns.map((col) => ({
                    ...col,
                    table: subqueryAlias,
                    name: col.alias, // The subquery outputs columns with their aliases
                })),
            );
        } else {
            // Original flattening logic for INNER joins or LEFT joins without nesting
            builder.joins.push({
                relation: r,
                path: [...path, r],
                type: joinType,
                table: joinBuilder.table,
                where: joinBuilder.where,
                orderBy: joinBuilder.orderBy,
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

            builder.columns.push(...joinBuilder.columns);
            builder.joins.push(...joinBuilder.joins);
        }

        // update the parent builder's tableIndex with the one from the
        // joinBuilder, so that we don't have overlapping table indices
        builder.tableIndex = joinBuilder.tableIndex;

        // this is admittedly a bit weird,
        // we wouldn't expect N:1 relations to specify
        // ordering, skipping, and limiting, and typescript
        // prevents users from doing this, but
        // we rely on them being present as part of the N:N
        // implementation
        builder.limit = min([builder.limit, joinBuilder.limit]);
        builder.offset = max([builder.offset, joinBuilder.offset]);
    }

    if (lateralBy.length > 0) {
        builder.lateralBy = {
            outerAlias: makeTableAlias(builder.tableIndex++),
            innerAlias: makeTableAlias(builder.tableIndex++),
            primaryKeys: lateralBy.map(({ field, values }) => ({
                column: getField(model, field).column,
                type: getField(model, field).type,
                values,
            })),
        };
    }

    builder.orderBy = [
        ...buildOrderBy(config, model, query, builder),
        ...builder.joins.flatMap((j) => j.orderBy ?? []),
    ];

    return builder;
};
