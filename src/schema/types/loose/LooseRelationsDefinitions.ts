import { ModelName } from "../helpers/ModelName";
import { LooseModelDefinitions } from "./LooseModelDefinitions";
import { LooseRelationsDefinition } from "./LooseRelationsDefinition";

export type LooseRelationsDefinitions<Models extends LooseModelDefinitions> = {
    [M in ModelName<Models>]?: LooseRelationsDefinition;
};
