import { Pool } from "pg";
import { logger } from "~/logger";
import { BaseQuery } from "~/types/queries/BaseQuery";
import { Schema } from "~/types/schema";

import { buildQuery } from "./builder/buildQuery";
import { queryToSql } from "./builder/queryToSql";

export const findMany = async (
    pool: Pool,
    schema: Schema,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildQuery(schema, m, query);
    const [sql, variables] = queryToSql(builder);
    logger.info("Executing query", { sql, variables });
    const result = await pool.query(sql, variables);
    return result.rows;
};
