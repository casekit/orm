import { Config } from "../../Config";
import { ModelDefinition } from "./ModelDefinition";

export type SchemaDefinition = {
    models: Record<string, ModelDefinition>;
    extensions?: string[];
    config?: Config;
};

export type SchemaDefinition2<Models extends Record<string, ModelDefinition>> =
    {
        models: Models;
        extensions?: string[];
        config?: Config;
    };
