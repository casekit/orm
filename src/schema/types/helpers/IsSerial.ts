import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { ColumnName } from "./ColumnName";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type IsSerial<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models, M>,
> = Columns<Models, M>[C]["type"] extends "serial" | "bigserial" | "smallserial"
    ? true
    : false;
