import { ModelDefinitions } from "../../schema/definitions/ModelDefinitions";
import { RelationDefinition } from "../../schema/definitions/RelationDefinition";
import { RelationsDefinitions } from "../../schema/definitions/RelationsDefinitions";
import { ModelName } from "../../schema/helpers/ModelName";

export type IncludedRelationModel<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Relations[M],
> =
    Relations[M][R] extends RelationDefinition<Models, M>
        ? Relations[M][R]["model"]
        : never;
