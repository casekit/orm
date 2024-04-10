import { groupBy } from "lodash-es";
import hash from "object-hash";
import { BaseConfiguration } from "src/types/base/BaseConfiguration";

import { OrmError } from "../errors";
import { logger } from "../logger";
import { Connection } from "../types/Connection";
import { BaseQuery } from "../types/queries/BaseQuery";
import { ensureArray } from "../util/ensureArray";
import { buildFindMany } from "./findMany/buildFindMany";
import { findManyToSql } from "./findMany/findManyToSql";
import { rowToObject } from "./util/rowToObject";

export const findMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const builder = buildFindMany(config, m, query);
    const statement = findManyToSql(config, builder);
    logger.info({
        message: "Executing query",
        sql: statement.text,
        values: statement.values,
    });

    const results = await conn
        .query(statement)
        .then((result) => result.rows.map(rowToObject(builder.columns)));

    for (const [r, subquery] of Object.entries(query.include ?? {})) {
        const relation = config.relations[m]![r];
        if (relation.type === "1:N") {
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
        } else if (relation.type === "N:N") {
            const joinFrom = Object.entries(config.relations[m]).find(
                ([, rel]) =>
                    rel.type === "1:N" && rel.model === relation.through,
            )?.[0];

            const joinTo = Object.entries(
                config.relations[relation.through],
            ).find(
                ([, rel]) => rel.type === "N:1" && rel.model === relation.model,
            )?.[0];

            if (joinFrom === undefined || joinTo === undefined) {
                throw new OrmError(
                    "Both sides of a N:N relation must be defined",
                    { data: { joinFrom, joinTo, query } },
                );
            }

            const pk = config.models[m].primaryKey;
            const fk = ensureArray(relation.foreignKey);
            const lateralBy = fk.map((c, index) => ({
                column: c,
                values: results.map((result) => result[pk[index]]),
            }));

            const subqueryResults = await findMany(
                conn,
                config,
                relation.through,
                {
                    select: ensureArray(relation.foreignKey),
                    include: { [joinTo]: subquery! },
                    lateralBy,
                },
            );
            const lookup = groupBy(subqueryResults, (result) => {
                return hash(fk.map((c) => result[c]));
            });

            for (const result of results) {
                const key = hash(pk.map((c) => result[c]));
                result[r] = (lookup[key] ?? []).map(
                    (relation) => relation[joinTo] ?? [],
                );
            }
        }
    }

    return results;
};
