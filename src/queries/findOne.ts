import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { OrmError } from "../errors";
import { Connection } from "../types/Connection";
import { findMany } from "./findMany";
import { BaseFindParams } from "./types/base/BaseFindParams";

export const findOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseFindParams,
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
