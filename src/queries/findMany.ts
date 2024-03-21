import { logger } from "~/logger";
import { Connection } from "~/types/Connection";
import { BaseQuery } from "~/types/queries/BaseQuery";
import { Schema } from "~/types/schema";

import { buildQuery } from "./builder/buildQuery";
import { queryToSql } from "./builder/queryToSql";
import { rowToObject } from "./builder/rowToObject";

export const findMany = async (
    conn: Connection,
    schema: Schema,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildQuery(schema, m, query);
    const [sql, variables] = queryToSql(builder);
    logger.info("Executing query", { sql, variables });
    const result = await conn.query(sql, variables);
    console.log(result.rows);
    return result.rows.map(rowToObject(builder.columns));
};
