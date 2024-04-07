import { ModelDefinitions } from "../definitions/ModelDefinitions";

export type ModelName<Models extends ModelDefinitions> = Extract<
    keyof Models,
    string
>;
