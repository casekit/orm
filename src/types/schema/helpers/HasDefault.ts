import { SchemaDefinition } from "../definition/SchemaDefinition";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type HasDefault<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends keyof Columns<S, M>,
> = null extends Columns<S, M>[C]["default"]
    ? false
    : undefined extends Columns<S, M>[C]["default"]
      ? false
      : true;
