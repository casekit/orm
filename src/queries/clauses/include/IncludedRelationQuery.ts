import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { FindManyParams } from "../../find/types/FindManyParams";
import { IncludedRelationModel } from "./IncludedRelationModel";

export type IncludedRelationQuery<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
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
