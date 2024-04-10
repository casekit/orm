import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { Connection } from "../types/Connection";
import { BaseCreateOneParams } from "../types/schema/helpers/queries/BaseCreateOneParams";
import { createMany } from "./createMany";

export const createOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseCreateOneParams,
) => {
    const result = await createMany(conn, config, m, {
        ...params,
        data: [params.data],
    });
    return Array.isArray(result) ? result[0] : result;
};
