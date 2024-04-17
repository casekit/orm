import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { FindManyParams } from "./FindManyParams";
import { FindOneResult } from "./FindOneResult";

export type FindManyResult<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyParams<Models, Relations, M>,
> = FindOneResult<Models, Relations, M, Q>[];
