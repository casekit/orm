import { groupBy } from "lodash-es";
import hash from "object-hash";
import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { BaseQuery } from "../types/queries/BaseQuery";
import { ensureArray } from "../util/ensureArray";
import { buildQuery } from "./builder/buildQuery";
import { queryToSql } from "./builder/queryToSql";
import { rowToObject } from "./builder/rowToObject";

export const findMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildQuery(config, m, query);
    const statement = queryToSql(builder);
    logger.info({
        message: "Executing query",
        sql: statement.text,
        values: statement.values,
    });

    const results = await conn
        .query(statement)
        .then((result) => result.rows.map(rowToObject(builder.columns)));

    for (const [r, subquery] of Object.entries(query.include ?? {})) {
        if (config.relations[m]?.[r]["type"] === "1:N") {
            const relation = config.relations[m][r];

            const pk = config.models[m].primaryKey;
            const fk = ensureArray(relation.foreignKey);

            const lateralBy = fk.map((c, index) => ({
                column: c,
                values: results.map((result) => result[pk[index]]),
            }));

            const subqueryResults = await findMany(
                conn,
                config,
                relation.model,
                { ...subquery!, lateralBy },
            );

            const lookup = groupBy(subqueryResults, (result) => {
                return hash(fk.map((c) => result[c]));
            });

            for (const result of results) {
                const key = hash(pk.map((c) => result[c]));
                result[r] = lookup[key] ?? [];
            }
        }
    }

    return results;
};
