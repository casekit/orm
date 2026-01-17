import { z } from "zod";

import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinition, OperatorDefinitions } from "@casekit/orm-schema";

import { buildCount } from "./builders/buildCount.js";
import { Connection } from "./connection.js";
import { countToSql } from "./sql/countToSql.js";
import { CountParams } from "./types/CountParams.js";
import { Middleware } from "./types/Middleware.js";

export const count = async (
    config: NormalizedConfig,
    conn: Connection,
    middleware: Middleware[],
    modelName: string,
    query: CountParams<
        Record<string, Required<ModelDefinition>>,
        OperatorDefinitions,
        string
    >,
): Promise<number> => {
    const builder = buildCount(config, middleware, modelName, query);
    const statement = countToSql(builder);

    config.logger.info("Executing count", {
        sql: statement.pretty,
        values: statement.values,
    });

    const result = await conn.query(statement);
    return z.coerce.number().parse(result.rows[0]?.["count"] ?? 0);
};
