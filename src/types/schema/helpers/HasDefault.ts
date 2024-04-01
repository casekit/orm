import { ModelDefinitions } from "../definition/ModelDefinitions";
import { Columns } from "./Columns";
import { ModelName2 } from "./ModelName";

export type HasDefault<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
    C extends keyof Columns<Models, M>,
> = null extends Columns<Models, M>[C]["default"]
    ? false
    : undefined extends Columns<Models, M>[C]["default"]
      ? false
      : true;
