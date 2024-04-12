import { WhereMiddleware as Middleware } from "../../queries/types/middleware/WhereMiddleware";
import { ModelDefinitions } from "../types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../types/definitions/RelationsDefinitions";

export const composeMiddleware = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    middlewares: Middleware<Models, Relations>[],
): Middleware<Models, Relations> => {
    return (config, m, where) => {
        return middlewares.reduce(
            (acc, middleware) => middleware(config, m, acc),
            where,
        );
    };
};
