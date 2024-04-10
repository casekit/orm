import { ModelDefinitions } from "../../../definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../definitions/RelationsDefinitions";
import { ModelName } from "../../ModelName";
import { FindManyQuery } from "../FindManyQuery";
import { IncludedRelationModel } from "./IncludedRelationModel";

export type IncludedRelationQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Q["include"] & keyof Relations[M],
    Q extends FindManyQuery<Models, Relations, M>,
> =
    Q["include"][R] extends FindManyQuery<
        Models,
        Relations,
        IncludedRelationModel<Models, Relations, M, R>
    >
        ? Q["include"][R]
        : never;
