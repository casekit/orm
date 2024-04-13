import { Middleware } from "../../queries/middleware/Middleware";
import { ModelDefinitions } from "../types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../types/definitions/RelationsDefinitions";

export const composeMiddleware = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    middleware: Middleware<Models, Relations>[],
): Middleware<Models, Relations> => {
    return {
        find: {
            where: middleware
                .map((m) => m.find?.where)
                .filter((fn): fn is NonNullable<typeof fn> => fn !== undefined)
                .reduce(
                    (acc, fn) => (config, model, where) =>
                        fn(config, model, acc(config, model, where)),
                    (_config, _m, where) => where,
                ),
        },
        create: {
            values: middleware
                .map((m) => m.create?.values)
                .filter((fn): fn is NonNullable<typeof fn> => fn !== undefined)
                .reduce(
                    (acc, fn) => (config, model, create) =>
                        fn(config, model, acc(config, model, create)),
                    (_config, _m, create) => create,
                ),
        },
        update: {
            set: middleware
                .map((m) => m.update?.set)
                .filter((fn): fn is NonNullable<typeof fn> => fn !== undefined)
                .reduce(
                    (acc, fn) => (config, model, create) =>
                        fn(config, model, acc(config, model, create)),
                    (_config, _m, create) => create,
                ),
            where: middleware
                .map((m) => m.update?.where)
                .filter((fn): fn is NonNullable<typeof fn> => fn !== undefined)
                .reduce(
                    (acc, fn) => (config, model, where) =>
                        fn(config, model, acc(config, model, where)),
                    (_config, _m, where) => where,
                ),
        },
    };
};
