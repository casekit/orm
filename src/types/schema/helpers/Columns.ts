import { ModelDefinitions } from "../definition/ModelDefinitions";
import { ModelName } from "./ModelName";

export type Columns<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Models[M]["columns"];
