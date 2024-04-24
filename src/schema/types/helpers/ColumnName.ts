import { LooseModelDefinition } from "../loose/LooseModelDefinition";

export type ColumnName<Model extends LooseModelDefinition> = Extract<
    keyof Model["columns"],
    string
>;
