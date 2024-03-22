import { CreateParams } from "~/types/queries/CreateParams";
import { Schema } from "~/types/schema";

import { tableAlias } from "./tableAlias";

export type CreateBuilder = {
    table: { name: string; schema: string };
    params: { name: string; path: string; value: unknown }[];
    returning: { name: string; path: string; alias: string }[];
};

export const buildCreate = (
    schema: Schema,
    m: string,
    params: CreateParams<Schema, string>,
    tableIndex = 0,
): CreateBuilder => {
    const builder: CreateBuilder = {
        table: {
            name: schema.models[m].table,
            schema: schema.models[m].schema,
        },
        params: [],
        returning: [],
    };

    const table = tableAlias(tableIndex);
    let colIndex = 0;

    const model = schema.models[m];

    for (const [k, v] of Object.entries(params.data)) {
        builder.params.push({
            name: model.columns[k]["name"],
            path: k,
            value: v,
        });
    }

    for (const f of params.returning ?? []) {
        builder.returning.push({
            name: model.columns[f]["name"],
            path: f,
            alias: `${table}_${colIndex++}`,
        });
    }

    return builder;
};