import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { logger } from "../logger";
import { buildUpdate } from "./update/buildUpdate";
import { BaseUpdateParams } from "./update/types/BaseUpdateParams";
import { updateToSql } from "./update/updateToSql";
import { rowToObject } from "./util/rowToObject";

export const updateMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseUpdateParams,
) => {
    const builder = buildUpdate(config, m, params);
    const statement = updateToSql(config, m, builder);
    logger.info({
        message: "Executing update",
        sql: statement.text,
        values: statement.values,
    });

    if (!process.env.CI) console.log(statement.text);

    const result = await conn.query(statement);
    return params.returning
        ? result.rows.map(rowToObject(builder.returning))
        : result.rowCount ?? 0;
};
