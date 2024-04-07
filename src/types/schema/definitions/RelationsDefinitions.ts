import { ModelName } from "../helpers/ModelName";
import { ModelDefinitions } from "./ModelDefinitions";
import { RelationsDefinition } from "./RelationsDefinition";

export type RelationsDefinitions<Models extends ModelDefinitions> = {
    [M in ModelName<Models>]?: RelationsDefinition<Models, M>;
};
