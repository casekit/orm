import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type HasDefault<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    C extends keyof Columns<Models, M>,
> = null extends Columns<Models, M>[C]["default"]
    ? false
    : undefined extends Columns<Models, M>[C]["default"]
      ? false
      : true;
