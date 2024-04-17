import { ModelName } from "../helpers/ModelName";
import { LooseModelDefinitions } from "./LooseModelDefinitions";
import { LooseRelationDefinition } from "./LooseRelationDefinition";

export type LooseRelationsDefinition<
    Models extends LooseModelDefinitions,
    _M extends ModelName<Models>,
> = Record<string, LooseRelationDefinition>;
