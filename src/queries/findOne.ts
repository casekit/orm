import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { OrmError } from "../errors";
import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { BaseQuery } from "../types/queries/BaseQuery";
import { buildQuery } from "./builder/buildQuery";
import { queryToSql } from "./builder/queryToSql";
import { rowToObject } from "./builder/rowToObject";

export const findOne = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildQuery(config, m, { ...query, limit: 2 });
    const statement = queryToSql(builder);
    logger.info({ message: "Executing query", sql: statement });

    const result = await conn.query(statement);

    if (result.rows.length === 0) {
        throw new OrmError("FindOne found zero records", {
            model: [m, config.models[m]],
            data: query,
        });
    }
    if (result.rows.length > 1) {
        throw new OrmError("FindOne found too many records", {
            model: [m, config.models[m]],
            data: query,
        });
    }
    return rowToObject(builder.columns)(result.rows[0]);
};
