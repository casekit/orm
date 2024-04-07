import { uniq } from "lodash-es";
import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { BaseQuery } from "../../types/queries/BaseQuery";
import { tableAlias } from "./tableAlias";

export type QueryBuilder = {
    columns: {
        table: string;
        name: string;
        alias: string;
        path: string[];
    }[];
    tables: {
        name: string;
        schema: string;
        alias: string;
    }[];
};

export const buildQuery = (
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
    path: string[] = [],
    tableIndex = 0,
): QueryBuilder => {
    const builder: QueryBuilder = {
        columns: [],
        tables: [],
    };

    const model = config.models[m];

    const table = tableAlias(tableIndex);
    let colIndex = 0;

    builder.tables.push({
        name: config.models[m]["table"],
        schema: config.models[m]["schema"],
        alias: table,
    });

    // make sure we always select the model's primary key - we'll strip it out later
    const select = uniq([...query.select, ...model.primaryKey]);

    for (const f of select) {
        builder.columns.push({
            table: table,
            name: model.columns[f]["name"],
            alias: `${table}_${colIndex++}`,
            path: [...path, f],
        });
    }

    return builder;
};
