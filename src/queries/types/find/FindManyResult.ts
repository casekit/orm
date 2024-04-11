import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { FindManyParams } from "./FindManyParams";
import { FindOneResult } from "./FindOneResult";

export type FindManyResult<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyParams<Models, Relations, M>,
> = FindOneResult<Models, Relations, M, Q>[];
