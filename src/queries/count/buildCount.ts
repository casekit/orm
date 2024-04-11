import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { ensureArray } from "../../util/ensureArray";
import { BaseCountParams } from "../types/base/BaseCountParams";
import { tableAlias } from "../util/tableAlias";
import { CountBuilder } from "./CountBuilder";

export const buildCount = (
    config: BaseConfiguration,
    m: string,
    query: BaseCountParams,
    path: string[] = [],
    _tableIndex = 0,
): CountBuilder => {
    const builder: CountBuilder = {
        tableIndex: _tableIndex,
        tables: [],
    };

    const model = config.models[m];

    const alias = tableAlias(builder.tableIndex++);

    builder.tables.push({
        name: config.models[m]["table"],
        model: m,
        schema: config.models[m]["schema"],
        alias: alias,
        where: config.middleware.find.where(config, m, query.where),
    });

    for (const [r, subquery] of Object.entries(query.include ?? {})) {
        const relation = config.relations[m][r];
        const joinedModel = config.models[relation.model];
        if (relation.type === "N:1") {
            const joinBuilder = buildCount(
                config,
                relation.model,
                subquery!,
                [...path, r],
                builder.tableIndex++,
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
        }
    }

    return builder;
};
