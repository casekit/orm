import { ModelDefinitions } from "#definition/ModelDefinitions.js";
import { ModelName } from "./ModelName.js";
import { RelationName } from "./RelationName.js";

export type RelationModel<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    R extends RelationName<Models[M]>,
> = Models[NonNullable<Models[M]["relations"]>[R]["model"]];
