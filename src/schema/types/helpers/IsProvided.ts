import { LooseModelDefinition } from "../loose/LooseModelDefinition";
import { ColumnName } from "./ColumnName";
import { Columns } from "./Columns";

export type IsProvided<
    Model extends LooseModelDefinition,
    C extends ColumnName<Model>,
> = Columns<Model>[C]["provided"];
