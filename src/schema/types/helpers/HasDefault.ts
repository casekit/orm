import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type HasDefault<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    C extends keyof Columns<Models, M>,
> = null extends Columns<Models, M>[C]["default"]
    ? false
    : undefined extends Columns<Models, M>[C]["default"]
      ? false
      : true;
