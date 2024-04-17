import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { Columns } from "./Columns";
import { ModelName } from "./ModelName";

export type IsNullable<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    C extends keyof Columns<Models, M>,
> = Columns<Models, M>[C]["nullable"] extends true ? true : false;
