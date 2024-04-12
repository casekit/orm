import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { Configuration } from "../../../types/Configuration";
import { UpdateValues } from "../update/UpdateValues";

export type UpdateSetMiddleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = <M extends ModelName<Models>>(
    config: Configuration<Models, Relations>,
    m: M,
    set: UpdateValues<Models, M>,
) => UpdateValues<Models, M>;
