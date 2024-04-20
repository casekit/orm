import { dropRight, get, groupBy, set } from "lodash-es";
import hash from "object-hash";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";

import { Connection } from "../Connection";
import { OrmError } from "../errors";
import { logger } from "../logger";
import { ensureArray } from "../util/ensureArray";
import { buildFind } from "./find/buildFind";
import { findToSql } from "./find/findToSql";
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

    if (process.env.NODE_ENV === "test" && !process.env.CI)
        console.log(statement.text);

    const results = await conn
        .query(statement)
        .then((result) => result.rows.map(rowToObject(builder.columns)));

    await Promise.all(
        getIncludedOneToManyRelations(config, m, query).map(
            ({ model, name, relation, query, path }) => {
                const pk = config.models[model].primaryKey;
                const fk = ensureArray(relation.foreignKey);
                const lateralBy = fk.map((c, index) => ({
                    column: c,
                    values: results.map((result) =>
                        get(result, [...dropRight(path, 1), pk[index]]),
                    ),
                }));
                return findMany(conn, config, relation.model, {
                    ...query,
                    lateralBy,
                }).then((subqueryResults) => {
                    console.log(subqueryResults.length);
                    const lookup = groupBy(subqueryResults, (result) => {
                        console.log(result.title);
                        console.log(
                            "fks: ",
                            fk.map((c) => result[c]),
                        );
                        return hash(fk.map((c) => result[c]));
                    });
                    for (const result of results) {
                        console.log(
                            "pks: ",
                            pk.map((c) =>
                                get(result, [...dropRight(path, 1), c]),
                            ),
                        );
                        const key = hash(
                            pk.map((c) =>
                                get(result, [...dropRight(path, 1), c]),
                            ),
                        );
                        console.log([...path]);
                        set(result, [...path], lookup[key] ?? []);
                    }
                });
            },
        ),
    );

    console.log(results[0].posts);

    for (const [r, subquery] of Object.entries(query.include ?? {})) {
        const relation = config.relations[m]![r];
        if (relation.type === "1:N") {
            //     const relation = config.relations[m][r];
            //     const pk = config.models[m].primaryKey;
            //     const fk = ensureArray(relation.foreignKey);
            //     const lateralBy = fk.map((c, index) => ({
            //         column: c,
            //         values: results.map((result) => result[pk[index]]),
            //     }));
            //     const subqueryResults = await findMany(
            //         conn,
            //         config,
            //         relation.model,
            //         { ...subquery!, lateralBy },
            //     );
            //     const lookup = groupBy(subqueryResults, (result) => {
            //         return hash(fk.map((c) => result[c]));
            //     });
            //     for (const result of results) {
            //         const key = hash(pk.map((c) => result[c]));
            //         result[r] = lookup[key] ?? [];
            //     }
        } else if (relation.type === "N:N") {
            console.log("Fetching N:N relation");
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
