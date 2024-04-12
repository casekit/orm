import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { UpdateValuesMiddleware } from "./UpdateValuesMiddleware";
import { CreateValuesMiddleware } from "./ValuesMiddleware";
import { WhereMiddleware } from "./WhereMiddleware";

export type Middleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = {
    find?: {
        where?: WhereMiddleware<Models, Relations>[];
    };
    create?: {
        values?: CreateValuesMiddleware<Models, Relations>[];
    };
    update?: {
        values?: UpdateValuesMiddleware<Models, Relations>[];
        where?: WhereMiddleware<Models, Relations>[];
    };
};
