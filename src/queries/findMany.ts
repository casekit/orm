import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { BaseQuery } from "../types/queries/BaseQuery";
import { PopulatedSchema } from "../types/schema";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";
import { buildQuery } from "./builder/buildQuery";
import { queryToSql } from "./builder/queryToSql";
import { rowToObject } from "./builder/rowToObject";

export const findMany = async <Models extends ModelDefinitions>(
    conn: Connection,
    schema: PopulatedSchema<Models>,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildQuery(schema, m, query);
    const [sql, variables] = queryToSql(builder);
    logger.info({ message: "Executing query", sql, variables });
    const result = await conn.query(sql, variables);
    return result.rows.map(rowToObject(builder.columns));
};
