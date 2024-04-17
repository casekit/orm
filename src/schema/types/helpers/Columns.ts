import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { ModelName } from "./ModelName";

export type Columns<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = Models[M]["columns"];
