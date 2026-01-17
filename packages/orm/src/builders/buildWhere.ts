import { NormalizedConfig } from "@casekit/orm-config";
import {
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";
import { SQLStatement, sql } from "@casekit/sql";

import { $and, $not, $or, defaultOperators } from "../operators.js";
import { Middleware } from "../types/Middleware.js";
import { WhereClause } from "../types/WhereClause.js";
import { applyWhereMiddleware } from "../util/applyWhereMiddleware.js";
import { hasClauses } from "../util/hasClauses.js";
import { Table } from "./types.js";

export const buildWhere = (
    config: NormalizedConfig,
    middleware: Middleware[],
    table: Table,
    where?: WhereClause<
        ModelDefinitions,
        OperatorDefinitions,
        ModelName<ModelDefinitions>
    >,
): SQLStatement | null => {
    // Apply middleware to the where clause
    const processedWhere =
        applyWhereMiddleware(config, middleware, table.model, where) ?? {};

    if (!hasClauses(processedWhere)) {
        return null;
    }

    // NB. Object.entries does not iterate over the symbol keys
    // of an object, so this is a neat way for us to get just the
    // clauses that relate to specific fields, and not logic operators
    // like $and, $or, $not.
    const clauses: SQLStatement[] = Object.entries(processedWhere).map(
        ([field, value]) => {
            const tableAlias = table.alias;
            const column = config.models[table.model]?.fields[field]?.column;
            if (!column) throw new Error("Unrecognised field: " + field);

            // either null or undefined counts as null, to avoid surprises
            if (value === null || value === undefined) {
                return sql`${sql.ident(tableAlias)}.${sql.ident(column)} IS NULL`;
            }
            if (value === true) {
                return sql`${sql.ident(tableAlias)}.${sql.ident(column)} IS TRUE`;
            }

            if (value === false) {
                return sql`${sql.ident(tableAlias)}.${sql.ident(column)} IS FALSE`;
            }

            // value types
            if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean" ||
                value instanceof Date ||
                Object.getOwnPropertySymbols(value).length === 0
            ) {
                return sql`${sql.ident(tableAlias)}.${sql.ident(column)} = ${sql.value(value)}`;
            }

            //operator clauses - more than one can be specified
            const subclauses = Object.getOwnPropertySymbols(value).map(
                (op): SQLStatement => {
                    const opValue = (value as Record<symbol, unknown>)[op];

                    const operator =
                        op in config.operators.where
                            ? config.operators.where[op]
                            : op in defaultOperators
                              ? defaultOperators[
                                    op as keyof typeof defaultOperators
                                ]
                              : null;

                    if (!operator) {
                        throw new Error(
                            `Unrecognised query operator or value: ${JSON.stringify(opValue)}`,
                        );
                    }
                    return operator(
                        {
                            table: sql.ident(tableAlias),
                            column: sql.ident(column),
                        },
                        opValue ?? null,
                    );
                },
            );
            return sql.join(subclauses, " AND ");
        },
    );

    // logical operators
    if (processedWhere[$and]) {
        const subclauses = processedWhere[$and].map((clause) => {
            const subclause = buildWhere(config, middleware, table, clause);
            if (!subclause) {
                throw new Error("AND clause must not be empty");
            }
            return subclause;
        });
        clauses.push(sql`(${sql.join(subclauses, " AND ")})`);
    }

    if (processedWhere[$or]) {
        const subclauses = processedWhere[$or].map((clause) => {
            const subclause = buildWhere(config, middleware, table, clause);
            if (!subclause) {
                throw new Error("OR clause must not be empty");
            }
            return subclause;
        });
        clauses.push(sql`(${sql.join(subclauses, " OR ")})`);
    }

    if (processedWhere[$not]) {
        const subclause = buildWhere(
            config,
            middleware,
            table,
            processedWhere[$not],
        );
        if (!subclause) {
            throw new Error("NOT clause must not be empty");
        }
        clauses.push(sql`NOT ${subclause}`);
    }

    return sql.join(clauses, " AND ");
};
