import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { ModelName } from "./ModelName";

export type Columns<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Models[M]["columns"];
