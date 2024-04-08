import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { OrmError } from "../errors";
import { Connection } from "../types/Connection";
import { BaseQuery } from "../types/queries/BaseQuery";
import { findMany } from "./findMany";

export const findOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const results = await findMany(conn, config, m, { ...query, limit: 2 });

    if (results.length === 0) {
        throw new OrmError("FindOne found zero records", {
            model: [m, config.models[m]],
            data: query,
        });
    }
    if (results.length > 1) {
        throw new OrmError("FindOne found too many records", {
            model: [m, config.models[m]],
            data: query,
        });
    }

    return results[0];
};
