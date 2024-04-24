import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { OrmError } from "../../errors";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { WhereClause } from "../clauses/WhereClause";
import { tableAlias } from "../util/tableAlias";
import { BaseDeleteParams } from "./types/BaseDeleteParams";

export type DeleteBuilder = {
    tableIndex: number;
    table: { table: string; model: string; alias: string; schema: string };
    where: WhereClause<LooseModelDefinitions, ModelName<LooseModelDefinitions>>;
    returning: { name: string; path: string; alias: string }[];
};

export const buildDelete = (
    config: BaseConfiguration,
    m: string,
    params: BaseDeleteParams,
    _tableIndex = 0,
): DeleteBuilder => {
    const builder: DeleteBuilder = {
        tableIndex: _tableIndex,
        table: {
            table: config.models[m].table,
            schema: config.models[m].schema,
            model: m,
            alias: tableAlias(_tableIndex++),
        },
        where: config.middleware.delete?.where
            ? config.middleware.delete.where(params.where, {
                  config,
                  model: m,
              })!
            : params.where,
        returning: [],
    };
    let colIndex = 0;
    const model = config.models[m];

    if (Object.keys(builder.where).length === 0) {
        throw new OrmError("No where clause provided for delete operation", {
            data: { m, model, params },
        });
    }

    for (const f of params.returning ?? []) {
        builder.returning.push({
            name: model.columns[f]["name"],
            path: f,
            alias: `${builder.table.alias}_${colIndex++}`,
        });
    }
    return builder;
};
