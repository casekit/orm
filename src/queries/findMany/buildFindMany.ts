import { max, min, uniq } from "lodash-es";
import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { BaseQuery } from "../../types/queries/BaseQuery";
import { ensureArray } from "../../util/ensureArray";
import { tableAlias } from "../util/tableAlias";
import { FindManyBuilder } from "./FindManyBuilder";

export const buildFindMany = (
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
    path: string[] = [],
    _tableIndex = 0,
): FindManyBuilder => {
    const builder: FindManyBuilder = {
        tableIndex: _tableIndex,
        columns: [],
        tables: [],
        orderBy: [],
    };

    const model = config.models[m];

    const alias = tableAlias(builder.tableIndex++);
    let colIndex = 0;

    builder.tables.push({
        name: config.models[m]["table"],
        schema: config.models[m]["schema"],
        alias: alias,
        where: query.where,
    });

    // make sure we always select the model's primary key,
    // and if necessary the foreign key for a lateral join
    // - we'll strip them out later
    const select = uniq([
        ...query.select,
        ...model.primaryKey,
        ...(query.lateralBy ?? []).map(({ column }) => column),
    ]);

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
            const joinBuilder = buildFindMany(
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
            // this is admittedly a bit weird,
            // we wouldn't expect N:1 relations to specify
            // ordering, skipping, and limiting, and typescript
            // prevents users from doing this, but
            // we rely on them being present as part of the N:N
            // implementation
            builder.tables.push(...otherTables);
            builder.columns.push(...joinBuilder.columns);
            builder.orderBy.push(...joinBuilder.orderBy);
            builder.limit = min([builder.limit, joinBuilder.limit]);
            builder.offset = max([builder.offset, joinBuilder.offset]);
        }
    }

    if (query.lateralBy) {
        builder.lateralBy = {
            groupTable: tableAlias(builder.tableIndex++),
            itemTable: tableAlias(builder.tableIndex++),
            columns: query.lateralBy.map(({ column, values }) => ({
                column: model.columns[column].name,
                type: model.columns[column].type,
                values,
            })),
        };
    }

    if (query.orderBy) {
        builder.orderBy = query.orderBy.map((o) => ({
            table: alias,
            column: Array.isArray(o) ? o[0] : o,
            direction: Array.isArray(o) ? o[1] : "asc",
        }));
    }

    if (query.limit) {
        builder.limit = query.limit;
    }

    if (query.offset) {
        builder.offset = query.offset;
    }

    return builder;
};
