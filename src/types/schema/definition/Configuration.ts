import { Config } from "../../Config";
import { ModelDefinition } from "./ModelDefinition";

export type Configuration<Models extends Record<string, ModelDefinition>> = {
    models: Models;
    extensions?: string[];
    config?: Config;
};
