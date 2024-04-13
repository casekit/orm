import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { FindManyParams } from "../../find/types/FindManyParams";
import { IncludedRelationModel } from "./IncludedRelationModel";

export type IncludedRelationQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Q["include"] & keyof Relations[M],
    Q extends FindManyParams<Models, Relations, M>,
> =
    Q["include"][R] extends FindManyParams<
        Models,
        Relations,
        IncludedRelationModel<Models, Relations, M, R>
    >
        ? Q["include"][R]
        : never;
