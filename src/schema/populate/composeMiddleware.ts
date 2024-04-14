import { last } from "lodash-es";

import { Middleware } from "../../queries/middleware/Middleware";

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
            where: compose(...middleware.map((m) => m.find?.where), where),
        },
        count: {
            where: compose(...middleware.map((m) => m.count?.where), where),
        },
        create: {
            values: compose(...middleware.map((m) => m.create?.values), values),
        },
        update: {
            values: compose(...middleware.map((m) => m.update?.values), values),
            where: compose(...middleware.map((m) => m.update?.where), where),
        },
        delete: {
            where: compose(...middleware.map((m) => m.delete?.where), where),
            deleteOne: last(
                middleware
                    .map((m) => m.delete?.deleteOne)
                    .filter(
                        (fn): fn is NonNullable<typeof fn> => fn !== undefined,
                    ),
            ),
            deleteMany: last(
                middleware
                    .map((m) => m.delete?.deleteMany)
                    .filter(
                        (fn): fn is NonNullable<typeof fn> => fn !== undefined,
                    ),
            ),
        },
    };
};
