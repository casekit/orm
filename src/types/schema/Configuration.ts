import { Config } from "../Config";
import { ModelDefinitions } from "./definitions/ModelDefinitions";
import { RelationsDefinitions } from "./definitions/RelationsDefinitions";

export type Configuration<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = {
    models: Models;
    relations?: Relations;
    extensions?: string[];
    config?: Config;
};
