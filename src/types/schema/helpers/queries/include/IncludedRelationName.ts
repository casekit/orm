import { ModelDefinitions } from "../../../definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../definitions/RelationsDefinitions";
import { ModelName } from "../../ModelName";
import { FindManyQuery } from "../FindManyQuery";

export type IncludedRelationName<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyQuery<Models, Relations, M>,
> = keyof Relations[M] & keyof Q["include"];
