import { NormalizedConfig } from "@casekit/orm-config";
import {
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { DeleteParams } from "#types/DeleteParams.js";
import { makeTableAlias } from "#util/makeTableAlias.js";
import { Middleware } from "../types/Middleware.js";
import { hasClauses } from "../util/hasClauses.js";
import { buildWhere } from "./buildWhere.js";
import { DeleteBuilder, Table } from "./types.js";

export const buildDelete = (
    config: NormalizedConfig,
    middleware: Middleware[],
    modelName: string,
    query: DeleteParams<
        ModelDefinitions,
        OperatorDefinitions,
        ModelName<ModelDefinitions>
    >,
    path: string[] = [],
    tableIndex = 0,
): DeleteBuilder => {
    const model = config.models[modelName];
    if (!model) throw new Error(`Model "${modelName}" not found`);

    const table: Table = {
        schema: model.schema,
        name: model.table,
        alias: makeTableAlias(tableIndex++),
        model: modelName,
    };

    if (!hasClauses(query.where)) {
        throw new Error("Delete queries must have a where clause");
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
        where,
        returning,
    };
};
