import { LooseModelDefinition } from "../schema/types/loose/LooseModelDefinition";

export type ColumnName<Model extends LooseModelDefinition> = Extract<
    keyof Model["columns"],
    string
>;
