import { LooseModelDefinition } from "../loose/LooseModelDefinition";

export type Columns<Model extends LooseModelDefinition> = Model["columns"];
