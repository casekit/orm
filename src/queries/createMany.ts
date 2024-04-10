import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { buildCreate } from "./create/buildCreate";
import { createToSql } from "./create/createToSql";
import { BaseCreateManyParams } from "./types/base/BaseCreateManyParams";
import { rowToObject } from "./util/rowToObject";

export const createMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseCreateManyParams,
) => {
    const builder = buildCreate(config, m, params);
    const statement = createToSql(builder);
    logger.info({
        message: "Executing create",
        sql: statement.text,
        values: statement.values,
    });
    const result = await conn.query(statement);
    return params.returning
        ? result.rows.map(rowToObject(builder.returning))
        : result.rowCount;
};
