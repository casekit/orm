import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import * as uuid from "uuid";

import { OrmError } from "../errors";
import { sql } from "../sql";
import { Connection } from "../types/Connection";
import { BaseUpdateParams } from "./types/base/BaseUpdateParams";
import { updateMany } from "./updateMany";

export const updateOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseUpdateParams,
) => {
    try {
        const savepoint = uuid.v4();
        conn.query(sql`"SAVEPOINT ${savepoint}`);
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

        conn.query(sql`RELEASE SAVEPOINT ${savepoint}`);

        return typeof results === "number" ? results : results[0];
    } catch (e) {
        conn.query("ROLLBACK TO SAVEPOINT ${savepoint}");
    }
};
