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
    const statement = queryToSql(builder);
    logger.info({
        message: "Executing query",
        sql: statement.text,
        values: statement.values,
    });
    console.log(statement.text);
    const result = await conn.query(statement);
    return result.rows.map(rowToObject(builder.columns));
};
