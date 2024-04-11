import { WhereMiddleware } from "../../queries/types/middleware/WhereMiddleware";
import { ModelDefinitions } from "../types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../types/definitions/RelationsDefinitions";

export const composeWhereMiddleware = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    middlewares: WhereMiddleware<Models, Relations>[],
): WhereMiddleware<Models, Relations> => {
    return (config, m, where) => {
        return middlewares.reduce(
            (acc, middleware) => middleware(config, m, acc),
            where,
        );
    };
};
