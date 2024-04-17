import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { FindManyParams } from "../../find/types/FindManyParams";

export type IncludedRelationName<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyParams<Models, Relations, M>,
> = keyof Relations[M] & keyof Q["include"];
