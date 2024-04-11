import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { FindManyParams } from "../find/FindManyParams";

export type IncludedRelationName<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyParams<Models, Relations, M>,
> = keyof Relations[M] & keyof Q["include"];
