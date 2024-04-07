import { ModelName } from "../helpers/ModelName";
import { ModelDefinitions } from "./ModelDefinitions";
import { RelationDefinition } from "./RelationDefinition";

export type RelationsDefinition<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Record<string, RelationDefinition<Models, M>>;
