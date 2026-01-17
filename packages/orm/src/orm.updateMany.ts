import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { buildUpdate } from "./builders/buildUpdate.js";
import { Connection } from "./connection.js";
import { updateToSql } from "./sql/updateToSql.js";
import { Middleware } from "./types/Middleware.js";
import { UpdateParams } from "./types/UpdateParams.js";
import { rowToObject } from "./util/rowToObject.js";

export const updateMany = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: UpdateParams<ModelDefinitions, OperatorDefinitions, string>,
): Promise<Record<string, unknown>[] | number> => {
    if (Object.keys(query.set).length === 0) {
        throw new Error("Update requires at least one value to set");
    }

    const builder = buildUpdate(config, middleware, modelName, query);
    const statement = updateToSql(builder);

    config.logger.info("Executing updateMany", {
        sql: statement.pretty,
        values: statement.values,
    });

    const tx = await conn.startTransaction();

    try {
        const result = await tx.query(statement);

        await tx.commit();
        if (query.returning) {
            return result.rows.map((row) =>
                rowToObject(row, builder.returning),
            );
        } else {
            return result.rowCount ?? 0;
        }
    } catch (e) {
        await tx.rollback();
        throw e;
    }
};
