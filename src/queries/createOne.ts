import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../types/Connection";
import { createMany } from "./createMany";
import { BaseCreateOneParams } from "./types/base/BaseCreateOneParams";

export const createOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseCreateOneParams,
) => {
    const result = await createMany(conn, config, m, {
        ...params,
        values: [params.values],
    });
    return Array.isArray(result) ? result[0] : result;
};
