import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";

export type ModelName<Models extends LooseModelDefinitions> = Extract<
    keyof Models,
    string
>;
