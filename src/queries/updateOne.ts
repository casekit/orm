import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { OrmError } from "../errors";
import { BaseUpdateParams } from "./update/types/BaseUpdateParams";
import { updateMany } from "./updateMany";

export const updateOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseUpdateParams,
) => {
    return await conn.transact(async (conn) => {
        const results = await updateMany(conn, config, m, params);

        const updatedCount =
            typeof results === "number" ? results : results?.length ?? 0;

        if (updatedCount === 0) {
            throw new OrmError("No rows updated", { data: { m, params } });
        }

        if (updatedCount > 1) {
            throw new OrmError(
                "More than one updated row for updateOne, rolling back",
                { data: { m, params, updatedCount } },
            );
        }

        return typeof results === "number" ? results : results[0];
    });
};
