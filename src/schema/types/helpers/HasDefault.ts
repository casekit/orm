import { LooseModelDefinition } from "../loose/LooseModelDefinition";
import { Columns } from "./Columns";

export type HasDefault<
    Model extends LooseModelDefinition,
    C extends keyof Columns<Model>,
> = null extends Columns<Model>[C]["default"]
    ? false
    : undefined extends Columns<Model>[C]["default"]
      ? false
      : true;
