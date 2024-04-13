import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { buildDelete } from "./delete/buildDelete";
import { deleteToSql } from "./delete/deleteToSql";
import { BaseDeleteParams } from "./delete/types/BaseDeleteParams";
import { rowToObject } from "./util/rowToObject";

export const deleteMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    params: BaseDeleteParams,
) => {
    const builder = buildDelete(config, m, params);
    const statement = deleteToSql(config, m, builder);
    logger.info({
        message: "Executing delete",
        sql: statement.text,
        values: statement.values,
    });

    if (process.env.NODE_ENV === "test" && !process.env.CI)
        console.log(statement.text);

    const result = await conn.query(statement);
    return params.returning
        ? result.rows.map(rowToObject(builder.returning))
        : result.rowCount ?? 0;
};
