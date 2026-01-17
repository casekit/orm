import { uniq } from "es-toolkit";

import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, ModelName } from "@casekit/orm-schema";

import { CreateManyParams } from "#types/CreateManyParams.js";
import { makeTableAlias } from "#util/makeTableAlias.js";
import { Middleware } from "../types/Middleware.js";
import { applyValuesMiddleware } from "../util/applyValuesMiddleware.js";
import { CreateBuilder, Table } from "./types.js";

export const buildCreate = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    query: CreateManyParams<ModelDefinitions, ModelName<ModelDefinitions>>,
    path: string[] = [],
    tableIndex = 0,
): CreateBuilder => {
    const model = config.models[modelName];
    if (!model) throw new Error(`Model "${modelName}" not found`);

    // Apply values middleware to each value object
    const processedValues = query.values.map((v) =>
        applyValuesMiddleware(config, middleware, modelName, v),
    );

    const fields = uniq(processedValues.flatMap(Object.keys));

    const table: Table = {
        schema: model.schema,
        name: model.table,
        alias: makeTableAlias(tableIndex++),
        model: modelName,
    };

    const columns = fields.map((f) => model.fields[f]!.column);
    const values = processedValues.map((v) => fields.map((f) => v[f] ?? null));
    const returning =
        query.returning?.map((f, index) => ({
            name: model.fields[f]!.column,
            alias: `${table.alias}_${index}`,
            path: [...path, f],
        })) ?? [];

    return {
        table,
        columns,
        values,
        returning,
        onConflict: query.onConflict,
    };
};
