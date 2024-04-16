import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { OrmError } from "../errors";
import { BaseDeleteParams } from "./delete/types/BaseDeleteParams";
import { deleteMany } from "./deleteMany";

export const deleteOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseDeleteParams,
) => {
    return await conn.transact(async (conn) => {
        const results = await deleteMany(conn, config, m, params);
        const deletedCount =
            typeof results === "number" ? results : results?.length ?? 0;

        if (deletedCount === 0) {
            throw new OrmError("No rows deleted", { data: { m, params } });
        }

        if (deletedCount > 1) {
            throw new OrmError(
                "More than one deleted row for deleteOne, rolling back",
                { data: { m, params, deletedCount } },
            );
        }

        return typeof results === "number" ? results : results[0];
    });
};
