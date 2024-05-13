import { dropRight, get, groupBy, set, uniq } from "lodash-es";
import hash from "object-hash";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { OrmError } from "../errors";
import { logger } from "../logger";
import { ensureArray } from "../util/ensureArray";
import { buildFind } from "./find/buildFind";
import { findToSql } from "./find/findToSql";
import { getIncludedManyToManyRelations } from "./find/getIncludedManyToManyRelations";
import { getIncludedOneToManyRelations } from "./find/getIncludedOneToManyRelations";
import { BaseFindParams } from "./find/types/BaseFindParams";
import { rowToObject } from "./util/rowToObject";

export const findMany = async (
    conn: Connection,
    config: BaseConfiguration,
    m: string,
    query: BaseFindParams,
) => {
    const builder = buildFind(config, m, query);
    const statement = findToSql(config, builder);
    logger.info({
        message: "Executing query",
        sql: statement.text,
        values: statement.values,
    });

    if (process.env.ORM_VERBOSE_LOGGING) {
        console.log(statement.text);
        console.log(statement.values);
    }

    const results = await conn
        .query(statement)
        .then((result) => result.rows.map(rowToObject(builder.columns)));

    const fetchIncludedOneToManyRelations = getIncludedOneToManyRelations(
        config,
        m,
        query,
    ).map(({ model, relation, query, path }) => {
        const pk = config.models[model].primaryKey;
        const fk = ensureArray(relation.foreignKey);
        const lateralBy = fk.map((c, index) => ({
            column: c,
            values: uniq(
                results.map((result) =>
                    get(result, [...dropRight(path, 1), pk[index]]),
                ),
            ),
        }));
        return findMany(conn, config, relation.model, {
            ...query,
            for: builder.for,
            lateralBy,
        }).then((subqueryResults) => {
            const lookup = groupBy(subqueryResults, (result) => {
                return hash(fk.map((c) => result[c]));
            });
            for (const result of results) {
                const parent =
                    path.length === 1
                        ? result
                        : get(result, dropRight(path, 1));
                if (parent !== undefined) {
                    const key = hash(pk.map((c) => get(parent, c)));
                    set(result, path, lookup[key] ?? []);
                }
            }
        });
    });

    const fetchIncludedManyToManyRelations = getIncludedManyToManyRelations(
        config,
        m,
        query,
    ).map(({ model, relation, query, path }) => {
        const joinFrom = Object.entries(config.relations[model]).find(
            ([, rel]) => rel.type === "1:N" && rel.model === relation.through,
        )?.[0];

        const joinTo = Object.entries(config.relations[relation.through]).find(
            ([, rel]) => rel.type === "N:1" && rel.model === relation.model,
        )?.[0];

        if (joinFrom === undefined || joinTo === undefined) {
            throw new OrmError("Both sides of a N:N relation must be defined", {
                data: { joinFrom, joinTo, query },
            });
        }

        const pk = config.models[model].primaryKey;
        const fk = ensureArray(relation.foreignKey);
        const lateralBy = fk.map((c, index) => ({
            column: c,
            values: uniq(
                results.map((result) =>
                    get(result, [...dropRight(path, 1), pk[index]]),
                ),
            ),
        }));

        return findMany(conn, config, relation.through, {
            select: ensureArray(relation.foreignKey),
            include: { [joinTo]: query },
            for: builder.for,
            lateralBy,
        }).then((subqueryResults) => {
            const lookup = groupBy(subqueryResults, (result) => {
                return hash(fk.map((c) => result[c]));
            });
            for (const result of results) {
                const parent =
                    path.length === 1
                        ? result
                        : get(result, dropRight(path, 1));

                if (parent !== undefined) {
                    const key = hash(pk.map((c) => get(parent, c)));
                    set(
                        result,
                        path,
                        (lookup[key] ?? []).map((r) => r[joinTo] ?? []),
                    );
                }
            }
        });
    });

    await Promise.all([
        ...fetchIncludedOneToManyRelations,
        ...fetchIncludedManyToManyRelations,
    ]);

    return results;
};
