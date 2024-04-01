import { ModelDefinitions } from "../definition/ModelDefinitions";
import { ColumnName2 } from "./ColumnName";
import { Columns } from "./Columns";
import { ModelName2 } from "./ModelName";

export type IsSerial<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
    C extends ColumnName2<Models, M>,
> = Columns<Models, M>[C]["type"] extends "serial" | "bigserial" | "smallserial"
    ? true
    : false;
