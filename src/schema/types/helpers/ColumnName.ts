import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { ModelName } from "./ModelName";

export type ColumnName<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = Extract<keyof Models[M]["columns"], string>;
