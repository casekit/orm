import { max, min, uniq } from "lodash-es";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { ensureArray } from "../../util/ensureArray";
import { tableAlias } from "../util/tableAlias";
import { BaseFindParams } from "./types/BaseFindParams";
import { FindBuilder } from "./types/FindBuilder";

export const buildFind = (
    config: BaseConfiguration,
    m: string,
    query: BaseFindParams,
    path: string[] = [],
    _tableIndex = 0,
): FindBuilder => {
    const builder: FindBuilder = {
        columns: [],
        table: {
            table: config.models[m]["table"],
            model: m,
            schema: config.models[m]["schema"],
            alias: tableAlias(_tableIndex++),
            where: config.middleware.find?.where
                ? config.middleware.find.where(query.where, {
                      config,
                      model: m,
                  })
                : query.where,
            joins: [],
        },
        orderBy: [],
        for: query.for,
        tableIndex: _tableIndex,
    };

    const model = config.models[m];

    const alias = builder.table.alias;
    let colIndex = 0;

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
            const joinBuilder = buildFind(
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
                    type: relation.optional ? "left" : "inner",
                    where: joinedTable.where,
                },
                ...joinedTable.joins,
            );
            // this is admittedly a bit weird,
            // we wouldn't expect N:1 relations to specify
            // ordering, skipping, and limiting, and typescript
            // prevents users from doing this, but
            // we rely on them being present as part of the N:N
            // implementation
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
            column: model.columns[Array.isArray(o) ? o[0] : o].name,
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
