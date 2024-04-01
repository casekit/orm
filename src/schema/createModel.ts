import { ColumnDefinition } from "../types/schema/definition/ColumnDefinition";
import { ModelDefinition } from "../types/schema/definition/ModelDefinition";

export const createModel = <Columns extends Record<string, ColumnDefinition>>(
    model: ModelDefinition<Columns>,
): ModelDefinition<Columns> => model;
