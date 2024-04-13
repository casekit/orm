import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { Configuration } from "../../types/Configuration";
import { CreateValues } from "../create/types/CreateOneParams";

export type CreateValuesMiddleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = <M extends ModelName<Models>>(
    config: Configuration<Models, Relations>,
    m: M,
    values: CreateValues<Models, M>,
) => CreateValues<Models, M>;
