import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions } from "@casekit/orm-schema";

import { buildCreate } from "./builders/buildCreate.js";
import { Connection } from "./connection.js";
import { createToSql } from "./sql/createToSql.js";
import { CreateOneParams } from "./types/CreateOneParams.js";
import { Middleware } from "./types/Middleware.js";
import { rowToObject } from "./util/rowToObject.js";

export const createOne = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    { values, ...query }: CreateOneParams<ModelDefinitions, string>,
): Promise<Record<string, unknown> | number | null> => {
    const builder = buildCreate(config, middleware, modelName, {
        ...query,
        values: [values],
    });
    const statement = createToSql(builder);

    config.logger.info("Executing createOne", {
        sql: statement.pretty,
        values: statement.values,
    });

    const tx = await conn.startTransaction();
    try {
        const result = await tx.query(statement);

        if (!result.rowCount && query.onConflict?.do !== "nothing") {
            throw new Error("createOne failed to create a row");
        }

        await tx.commit();

        if (query.returning) {
            return result.rowCount === 0
                ? null
                : rowToObject(result.rows[0]!, builder.returning);
        } else {
            return result.rowCount;
        }
    } catch (e) {
        await tx.rollback();
        throw e;
    }
};
