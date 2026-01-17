import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { buildUpdate } from "./builders/buildUpdate.js";
import { Connection } from "./connection.js";
import { updateToSql } from "./sql/updateToSql.js";
import { Middleware } from "./types/Middleware.js";
import { UpdateParams } from "./types/UpdateParams.js";
import { rowToObject } from "./util/rowToObject.js";

export const updateOne = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: UpdateParams<ModelDefinitions, OperatorDefinitions, string>,
): Promise<Record<string, unknown> | number | null> => {
    if (Object.keys(query.set).length === 0) {
        throw new Error("Update requires at least one value to set");
    }

    const builder = buildUpdate(config, middleware, modelName, query);
    const statement = updateToSql(builder);

    config.logger.info("Executing updateOne", {
        sql: statement.pretty,
        values: statement.values,
    });

    const tx = await conn.startTransaction();
    try {
        const result = await tx.query(statement);

        if (!result.rowCount || result.rowCount === 0) {
            throw new Error("Update one failed to update a row");
        } else if (result.rowCount > 1) {
            throw new Error("Update one would have updated more than one row");
        }

        await tx.commit();

        if (query.returning) {
            return rowToObject(result.rows[0]!, builder.returning);
        } else {
            return result.rowCount;
        }
    } catch (e) {
        await tx.rollback();
        throw e;
    }
};
