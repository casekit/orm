import { LooseModelDefinition } from "../loose/LooseModelDefinition";
import { ColumnName } from "./ColumnName";
import { Columns } from "./Columns";

export type IsSerial<
    Model extends LooseModelDefinition,
    C extends ColumnName<Model>,
> = Columns<Model>[C]["type"] extends "serial" | "bigserial" | "smallserial"
    ? true
    : false;
