import pgfmt from "pg-format";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import * as uuid from "uuid";

import { OrmError } from "../errors";
import { Connection } from "../types/Connection";
import { BaseUpdateParams } from "./update/types/BaseUpdateParams";
import { updateMany } from "./updateMany";

export const updateOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseUpdateParams,
) => {
    const savepoint = uuid.v4();
    try {
        conn.query(pgfmt("SAVEPOINT %I", savepoint));
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

        conn.query(pgfmt("RELEASE SAVEPOINT %I", savepoint));

        return typeof results === "number" ? results : results[0];
    } catch (e) {
        conn.query(pgfmt("ROLLBACK TO SAVEPOINT %I", savepoint));
        throw e;
    }
};
