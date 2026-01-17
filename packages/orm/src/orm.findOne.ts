import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, OperatorDefinitions } from "@casekit/orm-schema";

import { Connection } from "./connection.js";
import { findMany } from "./orm.findMany.js";
import { FindParams } from "./types/FindParams.js";
import { Middleware } from "./types/Middleware.js";

export const findOne = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: FindParams<ModelDefinitions, OperatorDefinitions, string>,
): Promise<Record<string, unknown>> => {
    config.logger.info("Delegating findOne to findMany");

    const results = await findMany(config, conn, middleware, modelName, query);

    if (results.length === 0) {
        throw new Error("Expected one row, but found none");
    }
    if (results.length > 1) {
        throw new Error("Expected one row, but found more");
    }
    return results[0]!;
};
