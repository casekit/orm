import { uniq } from "lodash-es";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { OrmError } from "../../errors";
import { tableAlias } from "../util/tableAlias";
import { BaseCreateManyParams } from "./types/BaseCreateManyParams";

export type CreateBuilder = {
    tableIndex: number;
    table: { table: string; schema: string };
    params: { name: string; path: string; values: unknown[] }[];
    onConflict?: { do: "nothing" };
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
            table: config.models[m].table,
            schema: config.models[m].schema,
        },
        params: [],
        returning: [],
    };

    const table = tableAlias(builder.tableIndex++);
    let colIndex = 0;

    const model = config.models[m];
    const values = params.values.map((v) =>
        config.middleware.create?.values
            ? config.middleware.create.values(v, { config, model: m })
            : v,
    );

    if (values.length === 0)
        throw new OrmError("No data provided for create operation", {
            data: { m, params },
        });

    const keys = uniq(values.flatMap((v) => Object.keys(v)));
    for (const k of keys) {
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

    builder.onConflict = params.onConflict;

    return builder;
};
