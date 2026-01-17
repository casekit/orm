import { dropRight, groupBy } from "es-toolkit";
import { get, set } from "es-toolkit/compat";
import hash from "object-hash";

import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinition, OperatorDefinitions } from "@casekit/orm-schema";

import { buildFind } from "./builders/buildFind.js";
import { Connection } from "./connection.js";
import { findToSql } from "./sql/findToSql.js";
import { FindParams } from "./types/FindParams.js";
import { Middleware } from "./types/Middleware.js";
import { getIncludedToManySubqueries } from "./util/getIncludedToManySubqueries.js";
import { getLateralJoinValues } from "./util/getLateralJoinValues.js";
import { rowToObject } from "./util/rowToObject.js";

export const findMany = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: FindParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
    lateralBy: { field: string; values: unknown[] }[] = [],
): Promise<Record<string, unknown>[]> => {
    const builder = buildFind(config, middleware, modelName, query, lateralBy);

    const statement = findToSql(builder);

    config.logger.info("Executing findMany", {
        sql: statement.pretty,
        values: statement.values,
    });

    const results = await conn
        .query(statement)
        .then((res) =>
            res.rows.map((row) => rowToObject(row, builder.columns)),
        );

    const relationQueries: Promise<void>[] = [];

    const includedToManySubqueries = getIncludedToManySubqueries(
        config,
        modelName,
        query,
    );

    // There's no getting around it, this bit is fiddly.
    // Will do my best to explain what's going on.

    for (const {
        modelName,
        query,
        path,
        from,
        to,
        extract,
    } of includedToManySubqueries) {
        // this gets all the values of the 'from' columns on whichever the parent model
        // is - either the top level model or one of the N:1 joined models.
        const lateralBy = getLateralJoinValues(
            results,
            dropRight(path, 1),
            from,
            to,
        );

        // rather than awaiting the findMany query here, we'll push a promise
        // into an array that we can await in parallel later.
        const promise = findMany(
            config,
            conn,
            middleware,
            modelName,
            query,
            lateralBy,
        ).then((relationResults) => {
            // we group the results by the hash of the 'to' columns so
            // we can find the right list of values for each result
            const lookup = groupBy(relationResults, (result) =>
                hash(to.map((f) => result[f])),
            );
            for (const result of results) {
                // if the relation is on the top level model of the query,
                // the path length will be 1 and the parent of the relation
                // will be the result itself. otherwise the relation
                // will be on one of the N:1 relations of the top level model,
                // so we need to look up this object in the result by path
                const parent =
                    path.length === 1
                        ? result
                        : (get(result, dropRight(path, 1)) as
                              | Record<string, unknown>
                              | undefined);
                // if the relation is on an _optional_ N:1 relation of
                // the query's top level model, then the value being joined from
                // may not exist on the result. in that case there won't be any
                // children to join so we ignore it.
                if (parent !== undefined) {
                    // finally we can look up the relation values for the result
                    // and insert them into the result object at the correct path.
                    const key = hash(from.map((c) => get(parent, c)));
                    // if the relation is an N:N relation, the query we will have
                    // done will be wrapped in an 1:N relation query on the join
                    // model - so the result will be results of a _join model_
                    // query, not the actual relation model. the extract function
                    // makes sure that if this is the case, we extract the relevant
                    // field from the results so everything is wired up correctly
                    set(result, path, extract(lookup[key] ?? []));
                }
            }
        });

        relationQueries.push(promise);
    }

    await Promise.all(relationQueries);

    return results;
};
