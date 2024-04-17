import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { OrmError } from "../../errors";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { WhereClause } from "../clauses/WhereClause";
import { tableAlias } from "../util/tableAlias";
import { BaseUpdateParams } from "./types/BaseUpdateParams";

export type UpdateBuilder = {
    tableIndex: number;
    table: { name: string; model: string; alias: string; schema: string };
    where: WhereClause<LooseModelDefinitions, ModelName<LooseModelDefinitions>>;
    values: { name: string; value: unknown }[];
    returning: { name: string; path: string; alias: string }[];
};

export const buildUpdate = (
    config: BaseConfiguration,
    m: string,
    params: BaseUpdateParams,
    _tableIndex = 0,
): UpdateBuilder => {
    const builder: UpdateBuilder = {
        tableIndex: _tableIndex,
        table: {
            name: config.models[m].table,
            schema: config.models[m].schema,
            model: m,
            alias: tableAlias(_tableIndex++),
        },
        where: config.middleware.update?.where
            ? config.middleware.update.where(params.where, {
                  config,
                  model: m,
              })!
            : params.where!,
        values: [],
        returning: [],
    };
    let colIndex = 0;
    const model = config.models[m];
    const values = config.middleware.update?.values
        ? config.middleware.update.values(params.values, {
              config,
              model: m,
          })
        : params.values;

    if (values.length === 0) {
        throw new OrmError("No updates provided for update operation", {
            data: { m, model, params },
        });
    }

    if (Object.keys(builder.where).length === 0) {
        throw new OrmError("No where clause provided for update operation", {
            data: { m, model, params },
        });
    }

    for (const [k, v] of Object.entries(values)) {
        builder.values.push({
            name: model.columns[k]["name"],
            value: v,
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
