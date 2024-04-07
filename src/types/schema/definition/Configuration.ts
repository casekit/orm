import { Config } from "../../Config";
import { ModelDefinitions } from "./ModelDefinitions";
import { RelationsDefinitions } from "./RelationsDefinitions";

export type Configuration<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = {
    models: Models;
    relations?: Relations;
    extensions?: string[];
    config?: Config;
};
