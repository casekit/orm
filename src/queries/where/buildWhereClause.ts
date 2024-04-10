import { OrmError } from "../../errors";
import { SQLStatement, sql } from "../../sql";
import {
    $eq,
    $gt,
    $gte,
    $ilike,
    $in,
    $is,
    $like,
    $lt,
    $lte,
    $ne,
    $not,
} from "./operators";

export const buildWhereClause = (
    table: string,
    column: string,
    v: unknown,
): SQLStatement => {
    if (v === null) {
        return sql`%I.%I IS NULL`.withIdentifiers(table, column);
    } else if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        v instanceof Date ||
        Object.getOwnPropertySymbols(v).length === 0
    ) {
        return sql`%I.%I = ${v}`.withIdentifiers(table, column);
    } else {
        const clauses = Object.getOwnPropertySymbols(v).map(
            (op): SQLStatement => {
                const v2 = (v as Record<symbol, unknown>)[op];
                switch (op) {
                    case $eq:
                        return sql`%I.%I = ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $gt:
                        return sql`%I.%I > ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $gte:
                        return sql`%I.%I >= ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $ilike:
                        return sql`%I.%I ILIKE ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $in:
                        if (!Array.isArray(v2)) {
                            throw new OrmError(
                                "Non-array passed to IN clause",
                                { data: { table, column, v, v2 } },
                            );
                        } else if (v2.length === 0) {
                            return sql`%I.%I IN (NULL)`.withIdentifiers(
                                table,
                                column,
                            );
                        } else {
                            const values = v2.map((v) => sql`${v}`);
                            return sql`%I.%I IN (${sql.splat(values)})`.withIdentifiers(
                                table,
                                column,
                            );
                        }
                    case $is:
                        return sql`%I.%I IS ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $like:
                        return sql`%I.%I LIKE ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $lt:
                        return sql`%I.%I < ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $lte:
                        return sql`%I.%I <= ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $ne:
                        return sql`%I.%I != ${v2}`.withIdentifiers(
                            table,
                            column,
                        );
                    case $not:
                        if (v2 !== null) {
                            throw new OrmError(
                                "Unexpected value other than NULL in NOT clause: " +
                                    v2,
                            );
                        }
                        return sql`%I.%I IS NOT NULL`.withIdentifiers(
                            table,
                            column,
                        );
                    default:
                        throw new OrmError("Unexpected symbol in query", {
                            data: { table, column, op, v },
                        });
                }
            },
        );

        return sql.splat(clauses, " AND ");
    }
};
