import { ModelDefinitions } from "../definition/ModelDefinitions";
import { ModelName2 } from "./ModelName";

export type Columns<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = Models[M]["columns"];
