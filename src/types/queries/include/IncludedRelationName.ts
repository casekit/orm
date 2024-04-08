import { ModelDefinitions } from "../../schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../schema/definitions/RelationsDefinitions";
import { ModelName } from "../../schema/helpers/ModelName";
import { FindManyQuery } from "../FindManyQuery";

export type IncludedRelationName<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyQuery<Models, Relations, M>,
> = keyof Relations[M] & keyof Q["include"];
