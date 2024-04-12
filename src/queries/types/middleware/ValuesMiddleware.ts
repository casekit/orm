import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { Configuration } from "../../../types/Configuration";
import { OptionalParams } from "../helpers/OptionalParams";
import { RequiredParams } from "../helpers/RequiredParams";

export type CreateValuesMiddleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = <M extends ModelName<Models>>(
    config: Configuration<Models, Relations>,
    m: M,
    values: RequiredParams<Models, M> & OptionalParams<Models, M>,
) => RequiredParams<Models, M> & OptionalParams<Models, M>;
