import { ModelDefinitions } from "#definition/ModelDefinitions.js";

export type ModelName<Models extends ModelDefinitions> = Extract<
    keyof Models,
    string
>;
