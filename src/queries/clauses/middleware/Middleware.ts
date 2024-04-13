import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { CreateValuesMiddleware } from "./CreateValuesMiddleware";
import { UpdateSetMiddleware } from "./UpdateValuesMiddleware";
import { WhereMiddleware } from "./WhereMiddleware";

export type Middleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = {
    find?: {
        where?: WhereMiddleware<Models, Relations>;
    };
    create?: {
        values?: CreateValuesMiddleware<Models, Relations>;
    };
    update?: {
        set?: UpdateSetMiddleware<Models, Relations>;
        where?: WhereMiddleware<Models, Relations>;
    };
};
