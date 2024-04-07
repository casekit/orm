import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { BaseQuery } from "../types/queries/BaseQuery";
import { buildQuery } from "./builder/buildQuery";
import { queryToSql } from "./builder/queryToSql";
import { rowToObject } from "./builder/rowToObject";

export const findMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildQuery(config, m, query);
    const [sql, variables] = queryToSql(builder);
    logger.info({ message: "Executing query", sql, variables });
    const result = await conn.query(sql, variables);
    return result.rows.map(rowToObject(builder.columns));
};
