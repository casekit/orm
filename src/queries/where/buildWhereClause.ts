import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { SQLStatement, sql } from "../../sql";
import { interleave } from "../../util/interleave";
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

export const buildClause = (
    table: string,
    column: string,
    v: Record<symbol, unknown> | string | number | boolean | Date | null,
): SQLStatement => {
    if (v === null) {
        return new SQLStatement(pgfmt("%I.%I", table, column)).push(
            sql` IS NULL`,
        );
    } else if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        v instanceof Date
    ) {
        return new SQLStatement(pgfmt("%I.%I", table, column)).push(
            sql` = ${v}`,
        );
    } else {
        const clauses = Object.getOwnPropertySymbols(v).map(
            (op): SQLStatement => {
                const v2 = v[op];
                switch (op) {
                    case $eq:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` = ${v2}`);
                    case $gt:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` > ${v2}`);
                    case $gte:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` >= ${v2}`);
                    case $ilike:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` ILIKE ${v2}`);
                    case $in:
                        if (!Array.isArray(v2)) {
                            throw new OrmError(
                                "Non-array passed to IN clause",
                                { data: { table, column, v, v2 } },
                            );
                        } else if (v2.length === 0) {
                            return new SQLStatement(
                                pgfmt("%I.%I IN (NULL)", table, column),
                            );
                        } else {
                            const values = v2.map((v) => sql`${v}`);
                            return new SQLStatement().push(
                                pgfmt("%I.%I", table, column),
                                sql` IN (`,
                                ...interleave(values, sql`, `),
                                sql`)`,
                            );
                        }
                    case $is:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` IS ${v2}`);
                    case $like:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` LIKE ${v2}`);
                    case $lt:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` < ${v2}`);
                    case $lte:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` <= ${v2}`);
                    case $ne:
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` != ${v2}`);
                    case $not:
                        if (v2 !== null) {
                            throw new OrmError(
                                "Unexpected value other than NULL in NOT clause: " +
                                    v2,
                            );
                        }
                        return new SQLStatement(
                            pgfmt("%I.%I", table, column),
                        ).push(sql` IS NOT NULL`);
                    default:
                        throw new OrmError("Unexpected symbol in query", {
                            data: { table, column, op, v },
                        });
                }
            },
        );

        return new SQLStatement().push(...interleave(clauses, sql` AND `));
    }
};
