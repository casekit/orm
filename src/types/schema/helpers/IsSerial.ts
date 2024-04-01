import { ModelDefinitions } from "../definition/ModelDefinitions";
import { ColumnName } from "./ColumnName";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type IsSerial<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models, M>,
> = Columns<Models, M>[C]["type"] extends "serial" | "bigserial" | "smallserial"
    ? true
    : false;
