import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { OrmError } from "..";
import { Connection } from "../Connection";
import { BaseCreateOneParams } from "./create/types/BaseCreateOneParams";
import { createMany } from "./createMany";

export const createOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseCreateOneParams,
) => {
    if (params.onConflict?.do === "nothing" && params.returning) {
        throw new OrmError(
            "Cannot use 'returning' with 'onConflict' in createOne",
            {
                data: { m, params },
            },
        );
    }
    const result = await createMany(conn, config, m, {
        ...params,
        values: [params.values],
    });
    return Array.isArray(result) ? result[0] : result;
};
