import { OperatorDefinition } from "@casekit/orm-schema";
import { sql } from "@casekit/sql";

export const $and = Symbol("and");
export const $eq = Symbol("eq");
export const $gt = Symbol("gt");
export const $gte = Symbol("gte");
export const $ilike = Symbol("ilike");
export const $in = Symbol("in");
export const $is = Symbol("is");
export const $like = Symbol("like");
export const $lt = Symbol("lt");
export const $lte = Symbol("lte");
export const $ne = Symbol("ne");
export const $not = Symbol("not");
export const $or = Symbol("or");

export const defaultOperators = {
    [$eq]: ({ table, column }, v) => sql`${table}.${column} = ${v}`,
    [$gt]: ({ table, column }, v) => sql`${table}.${column} > ${v}`,
    [$gte]: ({ table, column }, v) => sql`${table}.${column} >= ${v}`,
    [$ilike]: ({ table, column }, v) => sql`${table}.${column} ILIKE ${v}`,
    [$is]: ({ table, column }, v) => sql`${table}.${column} IS ${v}`,
    [$like]: ({ table, column }, v) => sql`${table}.${column} LIKE ${v}`,
    [$lt]: ({ table, column }, v) => sql`${table}.${column} < ${v}`,
    [$lte]: ({ table, column }, v) => sql`${table}.${column} <= ${v}`,
    [$ne]: ({ table, column }, v) => sql`${table}.${column} != ${v}`,
    [$in]: ({ table, column }, v) => {
        if (!Array.isArray(v)) throw new Error("Non-array passed to IN clause");
        if (v.length === 0) return sql`${table}.${column} IN (NULL)`;
        return sql`${table}.${column} IN (${v.map(sql.value)})`;
    },
    [$not]: ({ table, column }, v) => {
        switch (v) {
            case null:
                return sql`${table}.${column} IS NOT NULL`;
            case true:
                return sql`${table}.${column} IS NOT TRUE`;
            case false:
                return sql`${table}.${column} IS NOT FALSE`;
            default:
                throw new Error("Invalid value passed to $not operator");
        }
    },
} as const satisfies Record<symbol, OperatorDefinition>;
