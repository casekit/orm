import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationDefinition } from "../../../schema/types/definitions/RelationDefinition";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";

export type IncludedRelationModel<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Relations[M],
> =
    Relations[M][R] extends RelationDefinition<Models, M>
        ? Relations[M][R]["model"]
        : never;
