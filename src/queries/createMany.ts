import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { logger } from "../logger";
import { buildCreate } from "./create/buildCreate";
import { createToSql } from "./create/createToSql";
import { BaseCreateManyParams } from "./create/types/BaseCreateManyParams";
import { rowToObject } from "./util/rowToObject";

export const createMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseCreateManyParams,
) => {
    if (params.values.length === 0) {
        return params.returning ? [] : 0;
    }

    const builder = buildCreate(config, m, params);
    const statement = createToSql(builder);

    logger.info({
        message: "Executing create",
        sql: statement.text,
        values: statement.values,
    });

    if (process.env.ORM_VERBOSE_LOGGING) {
        console.log(statement.text);
        console.log(statement.values);
    }

    const result = await conn.query(statement);
    return params.returning
        ? result.rows.map(rowToObject(builder.returning))
        : result.rowCount;
};
