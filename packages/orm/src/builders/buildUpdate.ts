import { NormalizedConfig, getField } from "@casekit/orm-config";
import {
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { UpdateParams } from "#types/UpdateParams.js";
import { makeTableAlias } from "#util/makeTableAlias.js";
import { Middleware } from "../types/Middleware.js";
import { applySetMiddleware } from "../util/applySetMiddleware.js";
import { hasClauses } from "../util/hasClauses.js";
import { buildWhere } from "./buildWhere.js";
import { Table, UpdateBuilder } from "./types.js";

export const buildUpdate = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    query: UpdateParams<
        ModelDefinitions,
        OperatorDefinitions,
        ModelName<ModelDefinitions>
    >,
    path: string[] = [],
    tableIndex = 0,
): UpdateBuilder => {
    const model = config.models[modelName];
    if (!model) throw new Error(`Model "${modelName}" not found`);

    const table: Table = {
        schema: model.schema,
        name: model.table,
        alias: makeTableAlias(tableIndex++),
        model: modelName,
    };

    // Apply set middleware before processing
    const processedSet = applySetMiddleware(
        config,
        middleware,
        modelName,
        query.set,
    );

    const set = Object.entries(processedSet).map(
        ([field, value]): [string, unknown] => [
            getField(model, field).column,
            value,
        ],
    );

    if (!hasClauses(query.where)) {
        throw new Error("Update queries must have a where clause");
    }
    const where = buildWhere(config, middleware, table, query.where);

    const returning =
        query.returning?.map((f, index) => ({
            name: model.fields[f]!.column,
            alias: `${table.alias}_${index}`,
            path: [...path, f],
        })) ?? [];

    return {
        table,
        set,
        where,
        returning,
    };
};
