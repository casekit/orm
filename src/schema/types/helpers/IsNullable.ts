import { LooseModelDefinition } from "../loose/LooseModelDefinition";
import { Columns } from "./Columns";

export type IsNullable<
    Model extends LooseModelDefinition,
    C extends keyof Columns<Model>,
> = Columns<Model>[C]["nullable"] extends true ? true : false;
