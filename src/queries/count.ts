import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { logger } from "../logger";
import { buildCount } from "./count/buildCount";
import { countToSql } from "./count/countToSql";
import { BaseCountParams } from "./count/types/BaseCountParams";

export const count = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseCountParams,
) => {
    const builder = buildCount(config, m, query);
    const statement = countToSql(config, builder);
    logger.info({
        message: "Executing query",
        sql: statement.text,
        values: statement.values,
    });

    if (!process.env.CI) console.log(statement.text);

    const result = await conn
        .query(statement)
        .then((result) => result.rows[0].count);

    return result;
};
