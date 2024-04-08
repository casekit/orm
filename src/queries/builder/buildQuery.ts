import { uniq } from "lodash-es";
import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { BaseQuery } from "../../types/queries/BaseQuery";
import { ensureArray } from "../../util/ensureArray";
import { tableAlias } from "./tableAlias";

export type Join = {
    from: { table: string; columns: string[] };
    to: { table: string; columns: string[] };
};

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
        joins?: Join[];
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

    const alias = tableAlias(tableIndex++);
    let colIndex = 0;

    builder.tables.push({
        name: config.models[m]["table"],
        schema: config.models[m]["schema"],
        alias: alias,
    });

    // make sure we always select the model's primary key - we'll strip it out later
    const select = uniq([...query.select, ...model.primaryKey]);

    for (const f of select) {
        builder.columns.push({
            table: alias,
            name: model.columns[f]["name"],
            alias: `${alias}_${colIndex++}`,
            path: [...path, f],
        });
    }

    for (const [r, subquery] of Object.entries(query.include ?? {})) {
        const relation = config.relations[m][r];
        const joinedModel = config.models[relation.model];
        if (relation.type === "N:1") {
            const joinBuilder = buildQuery(
                config,
                relation.model,
                subquery!,
                [...path, r],
                tableIndex,
            );
            const [joinedTable, ...otherTables] = joinBuilder.tables;
            builder.tables.push({
                ...joinedTable,
                joins: [
                    ...(joinedTable.joins ?? []),
                    {
                        from: {
                            table: alias,
                            columns: ensureArray(relation.foreignKey).map(
                                (c) => model.columns[c].name,
                            ),
                        },
                        to: {
                            table: joinedTable.alias,
                            columns: joinedModel.primaryKey.map(
                                (c) => joinedModel.columns[c].name,
                            ),
                        },
                    },
                ],
            });
            builder.tables.push(...otherTables);
            builder.columns.push(...joinBuilder.columns);
        }
    }

    return builder;
};
