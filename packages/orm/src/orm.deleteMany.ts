import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { buildDelete } from "./builders/buildDelete.js";
import { Connection } from "./connection.js";
import { deleteToSql } from "./sql/deleteToSql.js";
import { DeleteParams } from "./types/DeleteParams.js";
import { Middleware } from "./types/Middleware.js";
import { rowToObject } from "./util/rowToObject.js";

export const deleteMany = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: DeleteParams<ModelDefinitions, OperatorDefinitions, string>,
): Promise<Record<string, unknown>[] | number> => {
    const builder = buildDelete(config, middleware, modelName, query);
    const statement = deleteToSql(builder);

    config.logger.info("Executing deleteMany", {
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
