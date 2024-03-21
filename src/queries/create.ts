import { logger } from "~/logger";
import { Connection } from "~/types/Connection";
import { CreateParams } from "~/types/queries/CreateParams";
import { Schema } from "~/types/schema";

import { buildCreate } from "./builder/buildCreate";
import { createToSql } from "./builder/createToSql";
import { rowToObject } from "./builder/rowToObject";

export const create = async (
    conn: Connection,
    schema: Schema,
    m: string,
    params: CreateParams<Schema, string>,
) => {
    const builder = buildCreate(schema, m, params);
    const [sql, variables] = createToSql(builder);
    logger.info("Executing insert", { sql, variables });
    const result = await conn.query(sql, variables);
    return params.returning
        ? rowToObject(builder.returning)(result.rows[0])
        : true;
};
