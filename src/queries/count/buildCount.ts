import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { ensureArray } from "../../util/ensureArray";
import { tableAlias } from "../util/tableAlias";
import { BaseCountParams } from "./types/BaseCountParams";
import { CountBuilder } from "./types/CountBuilder";

export const buildCount = (
    config: BaseConfiguration,
    m: string,
    query: BaseCountParams,
    path: string[] = [],
    _tableIndex = 0,
): CountBuilder => {
    const builder: CountBuilder = {
        table: {
            table: config.models[m]["table"],
            model: m,
            schema: config.models[m]["schema"],
            alias: tableAlias(_tableIndex++),
            joins: [],
            where: config.middleware.count?.where
                ? config.middleware.count.where(query.where, {
                      config,
                      model: m,
                  })
                : query.where,
        },
        tableIndex: _tableIndex,
    };

    const model = config.models[m];

    const alias = builder.table.alias;

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
            const joinedTable = joinBuilder.table;
            builder.table.joins.push(
                {
                    from: {
                        schema: config.models[m].schema,
                        table: config.models[m].table,
                        alias,
                        model: m,
                        columns: ensureArray(relation.foreignKey).map(
                            (c) => model.columns[c].name,
                        ),
                    },
                    to: {
                        schema: joinedModel.schema,
                        table: joinedTable.table,
                        alias: joinedTable.alias,
                        model: relation.model,
                        columns: joinedModel.primaryKey.map(
                            (c) => joinedModel.columns[c].name,
                        ),
                    },
                    where: joinedTable.where,
                    type: relation.optional ? "left" : "inner",
                },
                ...joinedTable.joins,
            );
        }
    }

    return builder;
};
