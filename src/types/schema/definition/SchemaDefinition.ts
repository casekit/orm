import { Config } from "../../Config";
import { ModelDefinition } from "./ModelDefinition";

export type SchemaDefinition<
    Models extends Record<string, ModelDefinition> = Record<
        string,
        ModelDefinition
    >,
> = {
    models: Models;
    extensions?: string[];
    config?: Config;
};
