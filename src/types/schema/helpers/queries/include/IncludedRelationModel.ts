import { ModelDefinitions } from "../../../definitions/ModelDefinitions";
import { RelationDefinition } from "../../../definitions/RelationDefinition";
import { RelationsDefinitions } from "../../../definitions/RelationsDefinitions";
import { ModelName } from "../../ModelName";

export type IncludedRelationModel<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Relations[M],
> =
    Relations[M][R] extends RelationDefinition<Models, M>
        ? Relations[M][R]["model"]
        : never;
