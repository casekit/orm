import { SchemaDefinition } from "../definition/SchemaDefinition";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type IsNullable<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends keyof Columns<S, M>,
> = Columns<S, M>[C]["nullable"] extends true ? true : false;
