import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { BaseCreateParams } from "../types/queries/BaseCreateParams";
import { buildCreate } from "./builder/buildCreate";
import { createToSql } from "./builder/createToSql";
import { rowToObject } from "./builder/rowToObject";

export const create = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseCreateParams,
) => {
    const builder = buildCreate(config, m, params);
    const statement = createToSql(builder);
    logger.info({
        message: "Executing insert",
        sql: statement.text,
        values: statement.values,
    });
    const result = await conn.query(statement);
    return params.returning
        ? rowToObject(builder.returning)(result.rows[0])
        : true;
};
