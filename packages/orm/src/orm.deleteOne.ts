import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { buildDelete } from "./builders/buildDelete.js";
import { Connection } from "./connection.js";
import { deleteToSql } from "./sql/deleteToSql.js";
import { DeleteParams } from "./types/DeleteParams.js";
import { Middleware } from "./types/Middleware.js";
import { rowToObject } from "./util/rowToObject.js";

export const deleteOne = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: DeleteParams<ModelDefinitions, OperatorDefinitions, string>,
): Promise<Record<string, unknown> | number | null> => {
    const builder = buildDelete(config, middleware, modelName, query);
    const statement = deleteToSql(builder);

    config.logger.info("Executing deleteOne", {
        sql: statement.pretty,
        values: statement.values,
    });

    const tx = await conn.startTransaction();
    try {
        const result = await tx.query(statement);

        if (!result.rowCount || result.rowCount === 0) {
            throw new Error("Delete one failed to delete a row");
        } else if (result.rowCount > 1) {
            throw new Error("Delete one would have deleted more than one row");
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
