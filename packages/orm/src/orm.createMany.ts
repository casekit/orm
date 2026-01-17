import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions } from "@casekit/orm-schema";

import { buildCreate } from "./builders/buildCreate.js";
import { Connection } from "./connection.js";
import { createToSql } from "./sql/createToSql.js";
import { CreateManyParams } from "./types/CreateManyParams.js";
import { Middleware } from "./types/Middleware.js";
import { rowToObject } from "./util/rowToObject.js";

export const createMany = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: CreateManyParams<ModelDefinitions, string>,
): Promise<Record<string, unknown>[] | number> => {
    if (query.values.length === 0) {
        return query.returning ? [] : 0;
    }

    const builder = buildCreate(config, middleware, modelName, query);
    const statement = createToSql(builder);

    config.logger.info("Executing createMany", {
        sql: statement.pretty,
        values: statement.values,
    });

    const tx = await conn.startTransaction();
    try {
        const result = await tx.query(statement);
        await tx.commit();

        return query.returning
            ? result.rows.map((row) => rowToObject(row, builder.returning))
            : (result.rowCount ?? 0);
    } catch (e) {
        await tx.rollback();
        throw e;
    }
};
