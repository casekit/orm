export const AND = Symbol("and");
export const EQ = Symbol("eq");
export const GT = Symbol("gt");
export const GTE = Symbol("gte");
export const ILIKE = Symbol("ilike");
export const IN = Symbol("in");
export const IS = Symbol("is");
export const LIKE = Symbol("like");
export const LT = Symbol("lt");
export const LTE = Symbol("lte");
export const NE = Symbol("ne");
export const NOT = Symbol("not");
export const OR = Symbol("or");

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

export const and = Symbol("and");
export const eq = Symbol("eq");
export const gt = Symbol("gt");
export const gte = Symbol("gte");
export const ilike = Symbol("ilike");
export const is = Symbol("is");
export const like = Symbol("like");
export const lt = Symbol("lt");
export const lte = Symbol("lte");
export const ne = Symbol("ne");
export const not = Symbol("not");
export const or = Symbol("or");

const db: any = {};
const op: any = {};

db.findMany("post", {
    select: ["id", "title", "content"],
    where: {
        [$or]: [
            { title: { [$ilike]: "bar" } },
            { content: { [$ilike]: "foo" } },
        ],
    },
});

db.findMany("post", {
    select: ["id", "title", "content"],
    where: {
        [OR]: [{ title: { [ILIKE]: "bar" } }, { content: { [ILIKE]: "foo" } }],
    },
});

db.findMany("post", {
    select: ["id", "title", "content"],
    where: {
        [op.or]: [
            { title: { [op.like]: "bar" } },
            { content: { [op.like]: "foo" } },
        ],
    },
});

// db.findMany("post", {
//     select: ["id", "title", "content"],
//     where: {
//         [or]: [{ title: { [like]: "bar" } }, { content: { [like]: "foo" } }],
//     },
// });
