import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { OrmError } from "../../errors";
import { tableAlias } from "../util/tableAlias";
import { BaseCreateManyParams } from "./types/BaseCreateManyParams";

export type CreateBuilder = {
    tableIndex: number;
    table: { name: string; schema: string };
    params: { name: string; path: string; values: unknown[] }[];
    returning: { name: string; path: string; alias: string }[];
};

export const buildCreate = (
    config: BaseConfiguration,
    m: string,
    params: BaseCreateManyParams,
    _tableIndex = 0,
): CreateBuilder => {
    const builder: CreateBuilder = {
        tableIndex: _tableIndex,
        table: {
            name: config.models[m].table,
            schema: config.models[m].schema,
        },
        params: [],
        returning: [],
    };

    const table = tableAlias(builder.tableIndex++);
    let colIndex = 0;

    const model = config.models[m];
    const values = params.values.map((v) =>
        config.middleware.create.values(config, m, v),
    );

    if (values.length === 0)
        throw new OrmError("No data provided for create operation", {
            data: { m, params },
        });

    for (const k of Object.keys(values[0])) {
        builder.params.push({
            name: model.columns[k]["name"],
            path: k,
            values: values.map((v) => v[k]),
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
