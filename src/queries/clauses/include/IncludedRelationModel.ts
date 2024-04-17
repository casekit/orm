import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationDefinition } from "../../../schema/types/loose/LooseRelationDefinition";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";

export type IncludedRelationModel<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Relations[M],
> = Relations[M][R] extends LooseRelationDefinition
    ? Extract<Relations[M][R]["model"], ModelName<Models>>
    : never;
