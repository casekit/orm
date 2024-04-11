import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { WhereMiddleware } from "./WhereMiddleware";

export type Middleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = {
    find?: {
        where?: WhereMiddleware<Models, Relations>[];
    };
};
