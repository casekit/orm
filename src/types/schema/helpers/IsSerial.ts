import { SchemaDefinition } from "../definition/SchemaDefinition";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type IsSerial<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends keyof Columns<S, M>,
> = Columns<S, M>[C]["type"] extends "serial" | "bigserial" | "smallserial"
    ? true
    : false;
