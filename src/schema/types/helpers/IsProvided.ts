import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { ColumnName } from "./ColumnName";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type IsProvided<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models, M>,
> = Columns<Models, M>[C]["provided"];
