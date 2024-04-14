import { Middleware } from "../../queries/middleware/Middleware";
import { ValuesMiddleware } from "../../queries/middleware/ValuesMiddleware";
import { WhereMiddleware } from "../../queries/middleware/WhereMiddleware";

const compose = <V, Meta>(
    ...middleware: (((v: V, meta: Meta) => V) | undefined)[]
): ((v: V, meta: Meta) => V) => {
    return middleware
        .filter((fn): fn is NonNullable<typeof fn> => fn !== undefined)
        .reduce(
            (acc, fn) => (v, meta) => fn(acc(v, meta), meta),
            (v, _meta) => v,
        );
};

export const composeMiddleware = (middleware: Middleware[]): Middleware => {
    const where = compose(...middleware.map((m) => m.where));
    const values = compose(...middleware.map((m) => m.values));
    return {
        find: {
            where: compose(
                ...middleware.map((m) => m.find?.where),
                where,
            ) as WhereMiddleware,
        },
        create: {
            values: compose(
                ...middleware.map((m) => m.create?.values),
                values,
            ) as ValuesMiddleware,
        },
        update: {
            set: compose(
                ...middleware.map((m) => m.update?.set),
                values,
            ) as ValuesMiddleware,
            where: compose(
                ...middleware.map((m) => m.update?.where),
                where,
            ) as WhereMiddleware,
        },
        delete: {
            where: compose(
                ...middleware.map((m) => m.delete?.where),
                where,
            ) as WhereMiddleware,
        },
    };
};
