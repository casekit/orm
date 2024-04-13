import pgfmt from "pg-format";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import * as uuid from "uuid";

import { OrmError } from "../errors";
import { Connection } from "../types/Connection";
import { BaseDeleteParams } from "./delete/types/BaseDeleteParams";
import { deleteMany } from "./deleteMany";

export const deleteOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseDeleteParams,
) => {
    const savepoint = uuid.v4();
    try {
        conn.query(pgfmt("SAVEPOINT %I", savepoint));
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

        conn.query(pgfmt("RELEASE SAVEPOINT %I", savepoint));

        return typeof results === "number" ? results : results[0];
    } catch (e) {
        conn.query(pgfmt("ROLLBACK TO SAVEPOINT %I", savepoint));
        throw e;
    }
};
