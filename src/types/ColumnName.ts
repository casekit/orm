import { ModelDefinition } from "../schema/types/definitions/ModelDefinition";

export type ColumnName<Model extends ModelDefinition> = Extract<
    keyof Model["columns"],
    string
>;
