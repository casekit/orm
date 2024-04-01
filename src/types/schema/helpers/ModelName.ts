import { ModelDefinitions } from "../definition/ModelDefinitions";

export type ModelName<Models extends ModelDefinitions> = Extract<
    keyof Models,
    string
>;
